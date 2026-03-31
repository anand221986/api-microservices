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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailMergeService = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("../db/db.service");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const crypto = require("crypto");
let MailMergeService = class MailMergeService {
    dbService;
    mailQueue;
    constructor(dbService, mailQueue) {
        this.dbService = dbService;
        this.mailQueue = mailQueue;
    }
    async sendMailMerge(payload) {
        if (!payload.userId) {
            throw new Error('userId is required');
        }
        const recipientCount = payload.recipients.length;
        const insertJobQuery = `
      INSERT INTO mail_merge_jobs (
        user_id,
        template_id,
        total,
        processed,
        status,
        file_name,
        sender_name,
        sender_email,
        reply_to,
        track_emails,
        scheduled_at
      )
      VALUES (
        $1, $2, $3, 0, 'PENDING',
        $4, $5, $6, $7, $8, $9
      )
      RETURNING id, user_id;
    `;
        const [job] = await this.dbService.executeQuery(insertJobQuery, [
            payload.userId,
            payload.templateId,
            recipientCount,
            payload.fileName,
            payload.sender.name,
            payload.sender.email,
            payload.sender.email,
            payload.trackEmails,
            payload.scheduledAt,
        ]);
        const jobId = job.id;
        const insertRecipientQuery = `
      INSERT INTO mail_merge_recipients (
        job_id,
        email,
        variables,
        status
      )
      VALUES ($1, $2, $3, 'PENDING')
    `;
        const insertSubscriptionQuery = `
      INSERT INTO email_subscriptions (
        email,
        unsubscribe_token,
        is_subscribed,
        subscribed_at
      )
      VALUES ($1, $2, TRUE, NOW())
      ON CONFLICT (email)
      DO NOTHING
    `;
        for (const recipient of payload.recipients) {
            await this.dbService.executeQuery(insertRecipientQuery, [
                jobId,
                recipient.email,
                JSON.stringify(recipient.variables || {}),
            ]);
            const unsubscribeToken = crypto.randomBytes(32).toString('hex');
            await this.dbService.executeQuery(insertSubscriptionQuery, [
                recipient.email,
                unsubscribeToken,
            ]);
        }
        return {
            message: 'Mail merge job created successfully',
            jobId,
            templateId: payload.templateId,
            userId: payload.userId,
            totalRecipients: recipientCount,
            status: 'PENDING',
        };
    }
    async startMailMerge(payload) {
        try {
            const jobData = await this.sendMailMerge(payload);
            console.log('✅ DB Job created successfully:', jobData);
            const redisJob = await this.mailQueue.add('send-mail', {
                jobId: jobData.jobId,
                templateId: jobData.templateId,
                userId: jobData.userId,
            }, {
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            });
            console.log('✅ Job inserted into Redis successfully');
            console.log('Redis Job ID:', redisJob.id);
            console.log('Redis Job Name:', redisJob.name);
            console.log('Redis Job Data:', redisJob.data);
            console.log('Redis Job Queue:', redisJob.queueName);
            return {
                message: 'Mail merge job created and queued',
                jobId: jobData.jobId,
                redisJobId: redisJob.id,
                totalRecipients: jobData.totalRecipients,
            };
        }
        catch (error) {
            console.error('❌ Error inserting job into Redis:', error);
            throw error;
        }
    }
    async sendScheduledemail(payload) {
        try {
            const jobData = await this.sendMailMerge(payload);
            return {
                message: 'Scheduled Job created successfully',
                result: jobData
            };
        }
        catch (error) {
            console.error('❌ Error inserting job into Redis:', error);
            throw error;
        }
    }
    async sendScheduledMailMerge(payload) {
        if (!payload.userId) {
            throw new Error('userId is required');
        }
        const recipientCount = payload.recipients.length;
        const insertJobQuery = `
      INSERT INTO mail_merge_jobs (
        user_id,
        template_id,
        total,
        processed,
        status,
        file_name,
        sender_name,
        sender_email,
        reply_to,
        track_emails,
        scheduled_at
      )
      VALUES (
        $1, $2, $3, 0, 'PENDING',
        $4, $5, $6, $7, $8, $9
      )
      RETURNING id, user_id;
    `;
        const [job] = await this.dbService.executeQuery(insertJobQuery, [
            payload.userId,
            payload.templateId,
            recipientCount,
            payload.fileName,
            payload.sender.name,
            payload.sender.email,
            payload.sender.email,
            payload.trackEmails,
            null,
        ]);
        const jobId = job.id;
        const insertRecipientQuery = `
      INSERT INTO mail_merge_recipients (
        job_id,
        email,
        variables,
        status
      )
      VALUES ($1, $2, $3, 'PENDING')
    `;
        const insertSubscriptionQuery = `
      INSERT INTO email_subscriptions (
        email,
        unsubscribe_token,
        is_subscribed,
        subscribed_at
      )
      VALUES ($1, $2, TRUE, NOW())
      ON CONFLICT (email)
      DO NOTHING
    `;
        for (const recipient of payload.recipients) {
            await this.dbService.executeQuery(insertRecipientQuery, [
                jobId,
                recipient.email,
                JSON.stringify(recipient.variables || {}),
            ]);
            const unsubscribeToken = crypto.randomBytes(32).toString('hex');
            await this.dbService.executeQuery(insertSubscriptionQuery, [
                recipient.email,
                unsubscribeToken,
            ]);
        }
        return {
            message: 'Mail merge job created successfully',
            jobId,
            templateId: payload.templateId,
            userId: payload.userId,
            totalRecipients: recipientCount,
            status: 'PENDING',
        };
    }
};
exports.MailMergeService = MailMergeService;
exports.MailMergeService = MailMergeService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_2.InjectQueue)('mail-queue')),
    __metadata("design:paramtypes", [db_service_1.DbService,
        bullmq_1.Queue])
], MailMergeService);
//# sourceMappingURL=mail-merge.service.js.map