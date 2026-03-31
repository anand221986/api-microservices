import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    private readonly logger;
    constructor(configService: ConfigService);
    sendLeadNotification(leadData: {
        name: string;
        email: string;
        subject: string;
        phone?: string;
        message: string;
    }): Promise<void>;
    sendThankYouEmail(leadData: {
        name: string;
        email: string;
        subject: string;
    }): Promise<void>;
    sendEmail(userId: number, emailData: any): Promise<void>;
    private getEmailLimit;
    private updateEmailLimit;
}
