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
exports.EmailWorker = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const gmail_service_1 = require("./gmail.service");
const db_service_1 = require("../db/db.service");
let EmailWorker = class EmailWorker extends bullmq_1.WorkerHost {
    gmailService;
    dbService;
    constructor(gmailService, dbService) {
        super();
        this.gmailService = gmailService;
        this.dbService = dbService;
    }
    async process(job) {
        const { jobId, templateId, userId } = job.data;
        console.log(`📨 Processing job: ${jobId}`);
        try {
            const template = await this.dbService.executeQuery(`SELECT subject, body FROM mail_templates WHERE id = $1`, [templateId]);
            if (!template.length) {
                throw new Error(`Template not found`);
            }
            const subjectTemplate = template[0].subject;
            const bodyTemplate = template[0].body;
            const recipients = await this.dbService.executeQuery(`
        SELECT r.id, r.email, r.variables, s.unsubscribe_token
        FROM mail_merge_recipients r
        INNER JOIN email_subscriptions s ON r.email = s.email
        WHERE r.job_id = $1
        AND r.status = 'PENDING'
        AND s.is_subscribed = TRUE
        `, [jobId]);
            console.log(`👥 Recipients: ${recipients.length}`);
            if (!recipients.length)
                return;
            const concurrency = 5;
            for (let i = 0; i < recipients.length; i += concurrency) {
                const batch = recipients.slice(i, i + concurrency);
                await Promise.all(batch.map((r) => this.processRecipient(r, subjectTemplate, bodyTemplate, userId)));
            }
            await this.dbService.executeQuery(`
        UPDATE mail_merge_jobs
        SET status='COMPLETED', completed_at=NOW()
        WHERE id=$1
        `, [jobId]);
            console.log(`🎉 Job completed`);
        }
        catch (error) {
            console.error(`🔥 Job failed`, error);
            throw error;
        }
    }
    async processRecipient(recipient, subjectTemplate, bodyTemplate, userId) {
        console.log(`📧 Sending → ${recipient.email}`);
        try {
            let variables = {};
            if (recipient.variables) {
                try {
                    variables =
                        typeof recipient.variables === 'object'
                            ? recipient.variables
                            : JSON.parse(recipient.variables);
                }
                catch {
                    variables = {};
                }
            }
            const subject = this.renderTemplate(subjectTemplate, variables);
            let body = this.renderTemplate(bodyTemplate, variables);
            const unsubscribeLink = `${process.env.API_URL}/unsubscribe?token=${recipient.unsubscribe_token}`;
            body += `
      <br><br>
      <hr>
      <p style="font-size:12px;color:gray;">
      If you don't want to receive these emails,
      <a href="${unsubscribeLink}">unsubscribe here</a>
      </p>
      `;
            const messageId = await this.gmailService.sendMail({
                userId,
                to: recipient.email,
                subject,
                body,
            });
            await this.dbService.executeQuery(`
        UPDATE mail_merge_recipients
        SET status='SUCCESS', message_id=$1, error_message=NULL
        WHERE id=$2
        `, [messageId, recipient.id]);
            console.log(`✅ Sent → ${recipient.email}`);
        }
        catch (error) {
            console.error(`❌ Failed → ${recipient.email}`);
            await this.dbService.executeQuery(`
        UPDATE mail_merge_recipients
        SET status='FAILED', error_message=$1
        WHERE id=$2
        `, [
                JSON.stringify({
                    message: error.message,
                }),
                recipient.id,
            ]);
        }
    }
    renderTemplate(template, variables) {
        return template.replace(/{{(.*?)}}/g, (_, key) => {
            const value = variables[key.trim()];
            return value ? String(value) : '';
        });
    }
};
exports.EmailWorker = EmailWorker;
exports.EmailWorker = EmailWorker = __decorate([
    (0, bullmq_1.Processor)('mail-queue'),
    __metadata("design:paramtypes", [gmail_service_1.GmailService,
        db_service_1.DbService])
], EmailWorker);
//# sourceMappingURL=email.worker.js.map