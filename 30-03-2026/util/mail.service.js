"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var IMailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMailService = void 0;
const common_1 = require("@nestjs/common");
const imaps = require("imap-simple");
const mailparser_1 = require("mailparser");
const fs = require("fs");
const path = require("path");
let IMailService = IMailService_1 = class IMailService {
    logger = new common_1.Logger(IMailService_1.name);
    async checkMails() {
        const config = {
            imap: {
                user: process.env.MAIL_USER,
                password: process.env.MAIL_PASS,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 3000,
            },
        };
        try {
            const connection = await imaps.connect(config);
            await connection.openBox('INBOX');
            const searchCriteria = ['UNSEEN'];
            const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true };
            const messages = await connection.search(searchCriteria, fetchOptions);
            for (const message of messages) {
                const all = message.parts.find((p) => p.which === 'TEXT');
                const raw = all?.body || '';
                const parsed = await (0, mailparser_1.simpleParser)(raw);
                this.logger.log(`New email from: ${parsed.from?.text}, subject: ${parsed.subject}`);
                if (parsed.attachments && parsed.attachments.length > 0) {
                    for (const attachment of parsed.attachments) {
                        const filePath = path.join(__dirname, `../../uploads/${attachment.filename}`);
                        fs.writeFileSync(filePath, attachment.content);
                        this.logger.log(`Saved attachment: ${attachment.filename}`);
                    }
                }
            }
        }
        catch (err) {
            this.logger.error('Error checking mails', err);
        }
    }
};
exports.IMailService = IMailService;
exports.IMailService = IMailService = IMailService_1 = __decorate([
    (0, common_1.Injectable)()
], IMailService);
//# sourceMappingURL=mail.service.js.map