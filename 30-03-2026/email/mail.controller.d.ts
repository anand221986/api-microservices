import { EmailService } from './email.service';
import { MailService } from './mail.service';
import { SendMailMergeDto, UpdateEmailTemplateDto, CreateEmailTemplateDto, CreateMailMergeJobDto } from './mail-merge.dto';
import { UtilService } from "../util/util.service";
import { MailMergeSendDto } from './mail-merged.dto';
import { MailMergeService } from './mail-merge.service';
export declare class EmailController {
    private readonly emailService;
    private readonly mailService;
    private readonly utilService;
    private readonly mailMergeService;
    constructor(emailService: EmailService, mailService: MailService, utilService: UtilService, mailMergeService: MailMergeService);
    sendMailMerge(dto: SendMailMergeDto): Promise<{
        total: number;
        results: {
            email: string;
            status: "SENT" | "FAILED";
            error?: string;
        }[];
    }>;
    uploadCsv(file: Express.Multer.File, templateId: number): Promise<{
        message: string;
        jobId: any;
        total: number;
        processed: number;
    }>;
    getAllTemplates(userId: string): Promise<any[]>;
    getTemplateById(id: number): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    remove(id: string): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    update(id: number, dto: UpdateEmailTemplateDto): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    create(dto: CreateEmailTemplateDto): Promise<any>;
    createJob(dto: CreateMailMergeJobDto): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    getJobs(): Promise<{
        status: boolean;
        result: any[];
    }>;
    getJobsbyId(jobId: number): Promise<{
        status: boolean;
        result: any[];
    }>;
    getMailTemplates(): Promise<{
        status: boolean;
        result: any;
    }>;
    removeJob(id: string): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    sendMergeMail(body: MailMergeSendDto): Promise<{
        message: string;
        jobId: any;
        redisJobId: string | undefined;
        totalRecipients: number;
    }>;
    sendScheduledMail(body: MailMergeSendDto): Promise<{
        message: string;
        result: {
            message: string;
            jobId: any;
            templateId: number;
            userId: number;
            totalRecipients: number;
            status: string;
        };
    }>;
    startMailMerge(body: MailMergeSendDto): Promise<{
        message: string;
        jobId: any;
    }>;
}
