export declare class SenderDto {
    name: string;
    email: string;
    replyTo?: string;
}
export declare class RecipientVariablesDto {
    firstname?: string;
    lastname?: string;
    unsubscribe_link?: string;
    [key: string]: any;
}
export declare class RecipientDto {
    email: string;
    variables?: Record<string, any>;
}
export declare class MailMergeSendDto {
    userId: number;
    fileName: string;
    templateId: number;
    trackEmails?: boolean;
    sender: SenderDto;
    recipients: RecipientDto[];
    scheduledAt?: Date;
}
export declare class SendMailMergeDto {
    userId: number;
    fileName: string;
    templateId: number;
    subject: string;
    template: string;
    sender: SenderDto;
    trackEmails?: boolean;
    scheduledAt?: Date;
    recipients: RecipientDto[];
}
