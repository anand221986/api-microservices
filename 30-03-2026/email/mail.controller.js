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
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
const mail_service_1 = require("./mail.service");
const mail_merge_dto_1 = require("./mail-merge.dto");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const util_service_1 = require("../util/util.service");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
const mail_merged_dto_1 = require("./mail-merged.dto");
const mail_merge_service_1 = require("./mail-merge.service");
let EmailController = class EmailController {
    emailService;
    mailService;
    utilService;
    mailMergeService;
    constructor(emailService, mailService, utilService, mailMergeService) {
        this.emailService = emailService;
        this.mailService = mailService;
        this.utilService = utilService;
        this.mailMergeService = mailMergeService;
    }
    sendMailMerge(dto) {
        return this.mailService.sendMailMerge(dto);
    }
    async uploadCsv(file, templateId) {
        return this.mailService.processCsvFile(file, templateId);
    }
    async getAllTemplates(userId) {
        let result = this.mailService.getTemplates(Number(userId));
        return result;
    }
    async getTemplateById(id) {
        let result = this.mailService.getTemplate(id);
        return this.utilService.successResponse(result, 'Get Templates Id successfully.');
    }
    async remove(id) {
        try {
            return await this.mailService.deleteTemplates(+id);
        }
        catch (error) {
            throw new common_1.HttpException({ message: 'Failed to delete blog', error: error.message }, common_1.HttpStatus.NOT_FOUND);
        }
    }
    update(id, dto) {
        return this.mailService.updateTemplate(id, dto);
    }
    create(dto) {
        return this.mailService.createTemplate(dto);
    }
    async createJob(dto) {
        return {
            status: true,
            message: 'Mail merge job created',
            result: await this.mailService.createJob(dto),
        };
    }
    async getJobs() {
        return {
            status: true,
            result: await this.mailService.getAllJobs(),
        };
    }
    async getJobsbyId(jobId) {
        return {
            status: true,
            result: await this.mailService.getAllJobs(jobId),
        };
    }
    async getMailTemplates() {
        return {
            status: true,
            result: await this.mailService.getTemplate(),
        };
    }
    async removeJob(id) {
        try {
            return await this.mailService.deleteJobs(+id);
        }
        catch (error) {
            throw new common_1.HttpException({ message: 'Failed to delete blog', error: error.message }, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async sendMergeMail(body) {
        return this.mailMergeService.startMailMerge(body);
    }
    async sendScheduledMail(body) {
        return this.mailMergeService.sendScheduledemail(body);
    }
    async startMailMerge(body) {
        const job = await this.mailMergeService.startMailMerge(body);
        return {
            message: 'Mail job queued successfully',
            jobId: job.jobId
        };
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Post)('merge'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mail_merge_dto_1.SendMailMergeDto]),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "sendMailMerge", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = './uploads/email';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${uniqueName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(csv)$/)) {
                return cb(new Error('Only CSV files are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "uploadCsv", null);
__decorate([
    (0, common_1.Get)("templates/:userId"),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getAllTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getTemplateById", null);
__decorate([
    (0, common_1.Delete)('templates/:id'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'templates deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'templates not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)('templates/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, mail_merge_dto_1.UpdateEmailTemplateDto]),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mail_merge_dto_1.CreateEmailTemplateDto]),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('merge-jobs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mail_merge_dto_1.CreateMailMergeJobDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "createJob", null);
__decorate([
    (0, common_1.Get)('merge-jobs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getJobs", null);
__decorate([
    (0, common_1.Get)('merge-jobs/:jobId'),
    __param(0, (0, common_1.Param)('jobId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getJobsbyId", null);
__decorate([
    (0, common_1.Get)('mail-templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getMailTemplates", null);
__decorate([
    (0, common_1.Delete)('merge-jobs/:id'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Merge Jobs deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Jobs not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "removeJob", null);
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mail_merged_dto_1.MailMergeSendDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendMergeMail", null);
__decorate([
    (0, common_1.Post)('send-scheduled-mail'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mail_merged_dto_1.MailMergeSendDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendScheduledMail", null);
__decorate([
    (0, common_1.Post)('start-merge'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mail_merged_dto_1.MailMergeSendDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "startMailMerge", null);
exports.EmailController = EmailController = __decorate([
    (0, swagger_1.ApiTags)('email'),
    (0, common_1.Controller)('email'),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        mail_service_1.MailService,
        util_service_1.UtilService,
        mail_merge_service_1.MailMergeService])
], EmailController);
//# sourceMappingURL=mail.controller.js.map