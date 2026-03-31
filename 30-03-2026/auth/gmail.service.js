"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailService = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
let GmailService = class GmailService {
    async sendMail(accessToken, to, subject, html) {
        const auth = new googleapis_1.google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const gmail = googleapis_1.google.gmail({ version: "v1", auth });
        const messageParts = [
            `To: ${to}`,
            "Content-Type: text/html; charset=utf-8",
            "MIME-Version: 1.0",
            `Subject: ${subject}`,
            "",
            html,
        ];
        const message = Buffer.from(messageParts.join("\n"))
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
        const response = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: message,
            },
        });
        return response.data;
    }
};
exports.GmailService = GmailService;
exports.GmailService = GmailService = __decorate([
    (0, common_1.Injectable)()
], GmailService);
//# sourceMappingURL=gmail.service.js.map