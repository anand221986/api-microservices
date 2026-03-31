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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailService = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
const db_service_1 = require("../db/db.service");
const crypto_util_1 = require("../util/crypto.util");
let GmailService = class GmailService {
    dbService;
    constructor(dbService) {
        this.dbService = dbService;
        this.validateEnv();
    }
    validateEnv() {
        if (!process.env.GOOGLE_CLIENT_ID ||
            !process.env.GOOGLE_CLIENT_SECRET ||
            !process.env.GOOGLE_REDIRECT_URL) {
            throw new Error('Missing Google OAuth environment variables');
        }
    }
    createOAuthClient() {
        return new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URL);
    }
    async getRefreshToken(userId) {
        const result = await this.dbService.executeQuery(`SELECT google_refresh_token FROM users WHERE id = $1`, [userId]);
        if (!result.length) {
            throw new common_1.UnauthorizedException(`User not found: ${userId}`);
        }
        const encryptedToken = result[0].google_refresh_token;
        if (!encryptedToken) {
            throw new common_1.UnauthorizedException('Refresh token not found');
        }
        return (0, crypto_util_1.decrypt)(encryptedToken);
    }
    buildRawMessage(to, subject, body) {
        const message = [
            `To: ${to}`,
            `Subject: ${subject}`,
            'Content-Type: text/html; charset=UTF-8',
            'MIME-Version: 1.0',
            '',
            body,
        ].join('\r\n');
        return Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
    async sendMail({ userId, to, subject, body, }) {
        try {
            console.log(`📧 Sending email for user ${userId}`);
            const refreshToken = await this.getRefreshToken(userId);
            const oauth2Client = this.createOAuthClient();
            oauth2Client.setCredentials({
                refresh_token: refreshToken,
            });
            const accessToken = await oauth2Client.getAccessToken();
            if (!accessToken?.token) {
                throw new common_1.UnauthorizedException('Failed to generate access token');
            }
            const gmail = googleapis_1.google.gmail({
                version: 'v1',
                auth: oauth2Client,
            });
            const rawMessage = this.buildRawMessage(to, subject, body);
            const response = await gmail.users.messages.send({
                userId: 'me',
                requestBody: { raw: rawMessage },
            });
            if (!response.data.id) {
                throw new common_1.InternalServerErrorException('Failed to send Gmail message');
            }
            console.log(`✅ Email sent → ${to}`);
            return response.data.id;
        }
        catch (error) {
            if (error.message?.includes('invalid_grant')) {
                console.error('❌ Refresh token expired');
                throw new common_1.UnauthorizedException('Google authorization expired. Please reconnect Gmail.');
            }
            console.error('❌ Gmail send failed:', error);
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
};
exports.GmailService = GmailService;
exports.GmailService = GmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService])
], GmailService);
//# sourceMappingURL=gmail.service.js.map