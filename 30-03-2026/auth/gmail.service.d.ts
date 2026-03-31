export declare class GmailService {
    sendMail(accessToken: string, to: string, subject: string, html: string): Promise<import("googleapis").gmail_v1.Schema$Message>;
}
