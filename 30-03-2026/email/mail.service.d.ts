import { MailerService } from '@nestjs-modules/mailer';
import { SendMailMergeDto, UpdateEmailTemplateDto, CreateEmailTemplateDto, CreateMailMergeJobDto, MailMergeSendDto } from './mail-merge.dto';
import { UtilService } from '../util/util.service';
import { DbService } from '../db/db.service';
import { Queue } from 'bullmq';
export declare class MailService {
    private mailQueue;
    private readonly dbService;
    private readonly utilService;
    private readonly mailerService;
    constructor(mailQueue: Queue, dbService: DbService, utilService: UtilService, mailerService: MailerService);
    sendMailMerge(dto: SendMailMergeDto): Promise<{
        total: number;
        results: {
            email: string;
            status: "SENT" | "FAILED";
            error?: string;
        }[];
    }>;
    processCsv(file: any, templateId: any): Promise<{
        message: string;
    }>;
    parseCsv(buffer: Buffer): Promise<any[]>;
    replaceTemplate(template: string, data: Record<string, any>): string;
    getTemplate(templateId?: number): Promise<any>;
    deleteTemplates(id: number): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    updateTemplate(templateId: number, dto: UpdateEmailTemplateDto): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    createTemplate(dto: CreateEmailTemplateDto): Promise<any>;
    processCsvFile(file: Express.Multer.File, templateId: number): Promise<{
        message: string;
        jobId: any;
        total: number;
        processed: number;
    }>;
    createJob(dto: CreateMailMergeJobDto): Promise<any>;
    getAllJobs(jobId?: number): Promise<any[]>;
    deleteJobs(id: number): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    createMailJob(body: MailMergeSendDto): Promise<import("bullmq").Job<any, any, string>>;
    getTemplates(userId?: number): Promise<any[]>;
}
