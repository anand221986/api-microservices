import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GmailService } from './gmail.service';
import { DbService } from '../db/db.service';
interface MailJobData {
    jobId: number;
    templateId: number;
    userId: number;
}
export declare class EmailWorker extends WorkerHost {
    private gmailService;
    private dbService;
    constructor(gmailService: GmailService, dbService: DbService);
    process(job: Job<MailJobData>): Promise<any>;
    private processRecipient;
    private renderTemplate;
}
export {};
