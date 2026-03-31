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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    configService;
    transporter;
    logger = new common_1.Logger(EmailService_1.name);
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('EMAIL_HOST'),
            port: Number(this.configService.get('EMAIL_PORT')),
            secure: false,
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
    }
    async sendLeadNotification(leadData) {
        const ownerEmail = this.configService.get('OWNER_EMAIL');
        const mailOptions = {
            from: this.configService.get('SMTP_FROM_EMAIL'),
            to: ownerEmail,
            subject: `New Lead: ${leadData.subject}`,
            replyTo: leadData.email,
            html: `
        <h2>New Lead Notification</h2>
        <p><b>Name:</b> ${leadData.name}</p>
        <p><b>Email:</b> <a href="mailto:${leadData.email}">${leadData.email}</a></p>
        <p><b>Subject:</b> ${leadData.subject}</p>
        ${leadData.phone ? `<p><b>Phone:</b> <a href="tel:${leadData.phone}">${leadData.phone}</a></p>` : ''}
        <p><b>Message:</b></p>
        <p>${leadData.message}</p>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log('Lead notification email sent');
        }
        catch (error) {
            this.logger.error('Error sending lead notification email', error);
            throw new Error('Failed to send lead notification');
        }
    }
    async sendThankYouEmail(leadData) {
        const mailOptions = {
            from: this.configService.get('SMTP_FROM_EMAIL'),
            to: leadData.email,
            subject: `Thank you for contacting us - ${leadData.subject}`,
            html: `
        <h2>Thank You for Contacting Us</h2>
        <p>Hello ${leadData.name},</p>
        <p>We have received your message and our team will get back to you soon.</p>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log('Thank-you email sent');
        }
        catch (error) {
            this.logger.error('Error sending thank-you email', error);
        }
    }
    async sendEmail(userId, emailData) {
        console.log(`Sending email to ${emailData.to}`);
        await this.updateEmailLimit(userId, emailData.count || 1);
    }
    async getEmailLimit(userId) {
    }
    async updateEmailLimit(userId, count) {
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map