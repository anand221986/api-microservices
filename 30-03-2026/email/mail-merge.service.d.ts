import { DbService } from '../db/db.service';
import { MailMergeSendDto } from './mail-merged.dto';
import { Queue } from 'bullmq';
export declare class MailMergeService {
    private readonly dbService;
    private mailQueue;
    constructor(dbService: DbService, mailQueue: Queue);
    sendMailMerge(payload: MailMergeSendDto): Promise<{
        message: string;
        jobId: any;
        templateId: number;
        userId: number;
        totalRecipients: number;
        status: string;
    }>;
    startMailMerge(payload: MailMergeSendDto): Promise<{
        message: string;
        jobId: any;
        redisJobId: string | undefined;
        totalRecipients: number;
    }>;
    sendScheduledemail(payload: MailMergeSendDto): Promise<{
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
    sendScheduledMailMerge(payload: MailMergeSendDto): Promise<{
        message: string;
        jobId: any;
        templateId: number;
        userId: number;
        totalRecipients: number;
        status: string;
    }>;
}
