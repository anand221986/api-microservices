"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GmailImapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailImapService = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
const db_service_1 = require("../db/db.service");
const util_service_1 = require("../util/util.service");
let GmailImapService = GmailImapService_1 = class GmailImapService {
    dbService;
    utilService;
    oauth2Client;
    logger = new common_1.Logger(GmailImapService_1.name);
    constructor(dbService, utilService) {
        this.dbService = dbService;
        this.utilService = utilService;
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        console.log(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    }
    clientId = process.env.GMAIL_CLIENT_ID;
    clientSecret = process.env.GMAIL_CLIENT_SECRET;
    refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    email = process.env.GMAIL_EMAIL;
    async getAccessToken() {
        const oAuth2Client = new googleapis_1.google.auth.OAuth2(this.clientId, this.clientSecret);
        oAuth2Client.setCredentials({ refresh_token: this.refreshToken });
        const { token } = await oAuth2Client.getAccessToken();
        if (!token) {
            throw new Error('Failed to retrieve access token');
        }
        return token;
    }
    async getUserToken(userId) {
        const query = `SELECT id, email, google_access_token, google_refresh_token ,token_expiry
                   FROM users WHERE id='${userId}'`;
        const list = await this.dbService.execute(query);
        return list[0];
    }
    async ensureValidToken(userId, user) {
        const userDetails = await this.getUserToken(user.email);
        console.log(userDetails, 'userdetails');
        this.oauth2Client.setCredentials({
            access_token: user.google_access_token,
            refresh_token: user.google_refresh_token,
        });
        if (user.token_expiry && new Date(user.token_expiry) < new Date()) {
            const newTokens = await this.oauth2Client.refreshAccessToken();
            const { access_token, expiry_date } = newTokens.credentials;
            const updateQuery = `
      UPDATE users
      SET google_access_token='${access_token}',
          token_expiry='${expiry_date ? new Date(expiry_date).toISOString() : null}'
      WHERE id='${userId}'
    `;
            console.log(updateQuery, 'update query');
            await this.dbService.execute(updateQuery);
        }
    }
    getGoogleAuthUrl(userId) {
        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/userinfo.email'
        ];
        const url = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes,
            state: JSON.stringify({ userId }),
        });
        return url;
    }
    async syncEmail(userId) {
        const user = await this.getUserToken(userId);
        if (!user?.google_access_token) {
            throw new Error(`No Google access token found for user ${userId}`);
        }
        this.oauth2Client.setCredentials({
            access_token: user.google_access_token,
            refresh_token: user.google_refresh_token,
        });
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth: this.oauth2Client });
        try {
            const res = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 5,
            });
            const messages = res.data.messages ?? [];
            if (messages.length === 0) {
                console.log('No messages found');
                return [];
            }
            const detailedMessages = await Promise.all(messages.map(async (m) => {
                const msgRes = await gmail.users.messages.get({
                    userId: 'me',
                    id: m.id,
                    format: 'full',
                });
                const payload = msgRes.data.payload;
                const headers = payload?.headers ?? [];
                const subject = headers.find((h) => h.name === 'Subject')?.value || '(no subject)';
                const from = headers.find((h) => h.name === 'From')?.value || '';
                let body = '';
                if (payload?.parts) {
                    const part = payload.parts.find((p) => p.mimeType === 'text/plain');
                    if (part?.body?.data) {
                        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                }
                else if (payload?.body?.data) {
                    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
                }
                const insertData = [
                    { set: 'message_id', value: String(m.id) },
                    { set: 'sender', value: String(from) },
                    { set: 'subject', value: String(subject) },
                    { set: 'body', value: String(body) },
                    { set: 'candidate_id', value: userId },
                    { set: 'recruiter_id', value: userId },
                    { set: 'received_at', value: new Date(new Date()).toISOString() },
                ];
                try {
                    const insertion = await this.dbService.insertData('conversations', insertData);
                }
                catch (err) {
                    this.logger.error(`Error inserting message ${m.id}:`, err.stack);
                }
                return {
                    id: m.id,
                    threadId: m.threadId,
                    subject,
                    from,
                    body,
                };
            }));
            console.log('Fetched detailed messages:', detailedMessages);
            return detailedMessages;
        }
        catch (err) {
            console.error('Error fetching Gmail messages:', err.message);
            throw err;
        }
    }
    async startSyncJobAlter(userId) {
        const syncInterval = setInterval(async () => {
            try {
                await this.syncEmail(userId);
            }
            catch (err) {
                this.logger.error(`Error syncing inbox for user ${userId}`, err.stack);
            }
        }, 60 * 1000);
        setTimeout(() => clearInterval(syncInterval), 5 * 60 * 1000);
    }
    async handleOAuthCallback(code, userId) {
        const { tokens } = await this.oauth2Client.getToken(code);
        const updateQuery = `
    UPDATE users 
    SET google_access_token='${tokens.access_token}', 
        google_refresh_token='${tokens.refresh_token}',
        token_expiry='${tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null}'
    WHERE id='${userId}'
  `;
        console.log(updateQuery, 'updateQuery');
        await this.dbService.execute(updateQuery);
        return tokens;
    }
};
exports.GmailImapService = GmailImapService;
exports.GmailImapService = GmailImapService = GmailImapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService,
        util_service_1.UtilService])
], GmailImapService);
//# sourceMappingURL=gmail-imap.service.js.map