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
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const util_service_1 = require("../util/util.service");
const db_service_1 = require("../db/db.service");
const csv = require("csv-parser");
const stream_1 = require("stream");
const fs = require("fs");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
let MailService = class MailService {
    mailQueue;
    dbService;
    utilService;
    mailerService;
    constructor(mailQueue, dbService, utilService, mailerService) {
        this.mailQueue = mailQueue;
        this.dbService = dbService;
        this.utilService = utilService;
        this.mailerService = mailerService;
    }
    async sendMailMerge(dto) {
        const results = [];
        for (const recipient of dto.recipients) {
            try {
                await this.mailerService.sendMail({
                    to: recipient.email,
                    subject: dto.subject,
                    template: dto.template,
                    context: recipient.data,
                });
                results.push({
                    email: recipient.email,
                    status: 'SENT',
                });
            }
            catch (error) {
                results.push({
                    email: recipient.email,
                    status: 'FAILED',
                    error: error.message,
                });
            }
        }
        return {
            total: dto.recipients.length,
            results,
        };
    }
    async processCsv(file, templateId) {
        const rows = await this.parseCsv(file.buffer);
        const template = await this.getTemplate(templateId);
        for (const row of rows) {
            try {
                const subject = this.replaceTemplate(template.subject, row);
                const body = this.replaceTemplate(template.body, row);
                await this.mailerService.sendMail({
                    to: row.email,
                    subject,
                    html: body,
                });
            }
            catch (err) {
            }
        }
        return { message: 'Mail merge completed' };
    }
    async parseCsv(buffer) {
        return new Promise((resolve, reject) => {
            if (!buffer) {
                return reject(new Error('CSV buffer is undefined'));
            }
            const results = [];
            stream_1.Readable.from(buffer)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    }
    replaceTemplate(template, data) {
        return template.replace(/{{(.*?)}}/g, (_, key) => {
            return data[key.trim()] ?? '';
        });
    }
    async getTemplate(templateId) {
        let query = `
    SELECT id, name, subject, body, created_at
    FROM mail_templates
  `;
        const values = [];
        if (templateId !== undefined) {
            query += ` WHERE id = $1 LIMIT 1`;
            values.push(templateId);
        }
        else {
            query += ` ORDER BY created_at DESC`;
        }
        const result = await this.dbService.executeQuery(query, values);
        if (templateId !== undefined && !result.length) {
            throw new common_1.NotFoundException(`Mail template with id ${templateId} does not exist`);
        }
        return templateId !== undefined ? result[0] : result;
    }
    async deleteTemplates(id) {
        try {
            const query = 'DELETE FROM mail_templates WHERE id = $1 RETURNING *';
            const result = await this.dbService.executeQuery(query, [id]);
            if (result.length === 0) {
                throw new common_1.NotFoundException(`templates with ID ${id} not found`);
            }
            return this.utilService.successResponse(`templates with ID ${id} deleted successfully.`);
        }
        catch (error) {
            console.error(`Error deleting templates with ID ${id}:`, error);
            throw error instanceof common_1.NotFoundException
                ? error
                : new common_1.InternalServerErrorException('Failed to delete templates');
        }
    }
    async updateTemplate(templateId, dto) {
        await this.getTemplate(templateId);
        try {
            const fields = [];
            const values = [];
            let index = 1;
            if (dto.name !== undefined) {
                fields.push(`name = $${index++}`);
                values.push(dto.name);
            }
            if (dto.subject !== undefined) {
                fields.push(`subject = $${index++}`);
                values.push(dto.subject);
            }
            if (dto.body !== undefined) {
                fields.push(`body = $${index++}`);
                values.push(dto.body);
            }
            fields.push(`updated_at = NOW()`);
            const query = `
        UPDATE mail_templates
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *;
      `;
            values.push(templateId);
            const result = await this.dbService.executeQuery(query, values);
            const updatedTemplate = result[0];
            return this.utilService.successResponse(updatedTemplate, 'Template updated successfully.');
        }
        catch (error) {
            console.error('Error updating template:', error);
            throw new common_1.InternalServerErrorException('Failed to update template');
        }
    }
    async createTemplate(dto) {
        const { name, subject, body, user_id } = dto;
        const query = `
      INSERT INTO mail_templates (name, subject, body,user_id, created_at)
      VALUES ($1, $2, $3,$4, NOW())
      RETURNING id, name, subject, body,user_id, created_at;
    `;
        const values = [name, subject, body, user_id];
        const result = await this.dbService.executeQuery(query, values);
        return result[0];
    }
    async processCsvFile(file, templateId) {
        if (!file?.path) {
            throw new Error('Uploaded file path not found');
        }
        const buffer = fs.readFileSync(file.path);
        const rows = await this.parseCsv(buffer);
        const total = rows.length;
        if (!total) {
            throw new Error('CSV file is empty');
        }
        const template = await this.getTemplate(templateId);
        const [job] = await this.dbService.executeQuery(`
    INSERT INTO mail_merge_jobs (template_id, total, processed, status)
    VALUES ($1, $2, 0, 'PROCESSING')
    RETURNING id;
    `, [templateId, total]);
        let processed = 0;
        for (const row of rows) {
            try {
                const subject = this.replaceTemplate(template.subject, row);
                const body = this.replaceTemplate(template.body, row);
                await this.dbService.executeQuery(`
        UPDATE mail_merge_jobs
        SET processed = $1
        WHERE id = $2;
        `, [processed, job.id]);
            }
            catch (error) {
                console.error(`Mail failed for ${row.email}`, error);
            }
        }
        await this.dbService.executeQuery(`
    UPDATE mail_merge_jobs
    SET status = 'COMPLETED'
    WHERE id = $1;
    `, [job.id]);
        fs.unlink(file.path, () => { });
        return {
            message: 'Mail merge completed',
            jobId: job.id,
            total,
            processed,
        };
    }
    async createJob(dto) {
        const query = `
    INSERT INTO mail_merge_jobs
      (template_id, total, processed, status)
    VALUES
      ($1, $2, 0, 'PENDING')
    RETURNING *;
  `;
        const [job] = await this.dbService.executeQuery(query, [
            dto.template_id,
            dto.total,
        ]);
        return job;
    }
    async getAllJobs(jobId) {
        let query = `SELECT mmj.*,
    mt.name AS template_name
FROM mail_merge_jobs mmj
JOIN mail_templates mt 
    ON mt.id = mmj.template_id `;
        const values = [];
        if (jobId) {
            query += ` WHERE id = $1 LIMIT 1`;
            values.push(jobId);
        }
        else {
            query += ` ORDER BY created_at DESC`;
        }
        console.log(query);
        const result = await this.dbService.executeQuery(query);
        if (jobId && !result.length) {
            throw new common_1.NotFoundException(`Mail template with id ${jobId} does not exist`);
        }
        return result;
    }
    async deleteJobs(id) {
        try {
            const query = 'DELETE FROM mail_merge_jobs WHERE id = $1 RETURNING *';
            const result = await this.dbService.executeQuery(query, [id]);
            const Query = 'DELETE FROM mail_merge_recipients WHERE id = $1 RETURNING *';
            const queryResult = await this.dbService.executeQuery(Query, [id]);
            if (result.length === 0) {
                throw new common_1.NotFoundException(`mail Merge Jobs with ID ${id} not found`);
            }
            return this.utilService.successResponse(`mail Merge with ID ${id} deleted successfully.`);
        }
        catch (error) {
            console.error(`Error deleting mail Merge with ID ${id}:`, error);
            throw error instanceof common_1.NotFoundException
                ? error
                : new common_1.InternalServerErrorException('Failed to delete mail Merge');
        }
    }
    async createMailJob(body) {
        const job = await this.mailQueue.add('send-mail', body, {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        });
        return job;
    }
    async getTemplates(userId) {
        let query = `
    SELECT id, name, subject, body, created_at
    FROM mail_templates
  `;
        const values = [];
        if (userId !== undefined) {
            query += ` WHERE user_id = $1 `;
            values.push(userId);
        }
        else {
            query += ` ORDER BY created_at DESC`;
        }
        const result = await this.dbService.executeQuery(query, values);
        if (userId !== undefined && !result.length) {
            throw new common_1.NotFoundException(`Mail template with id ${userId} does not exist`);
        }
        return userId !== undefined ? result : result;
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_2.InjectQueue)('mail-queue')),
    __metadata("design:paramtypes", [bullmq_1.Queue,
        db_service_1.DbService,
        util_service_1.UtilService,
        mailer_1.MailerService])
], MailService);
//# sourceMappingURL=mail.service.js.map