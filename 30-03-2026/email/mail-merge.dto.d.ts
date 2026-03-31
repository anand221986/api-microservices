export declare class MailMergeRecipientDto {
    email: string;
    data: Record<string, any>;
}
export declare class SendMailMergeDto {
    subject: string;
    template: string;
    recipients: MailMergeRecipientDto[];
}
export declare class UpdateEmailTemplateDto {
    name?: string;
    subject?: string;
    body?: string;
}
export declare class CreateEmailTemplateDto {
    name: string;
    subject: string;
    body: string;
    user_id: number;
}
export declare class CreateMailMergeJobDto {
    template_id: number;
    total: number;
}
export declare class MailMergeSendDto {
    emails: string[];
    subject: string;
    body: string;
}
