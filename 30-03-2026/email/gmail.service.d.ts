import { DbService } from '../db/db.service';
interface SendMailOptions {
    userId: number;
    to: string;
    subject: string;
    body: string;
}
export declare class GmailService {
    private readonly dbService;
    constructor(dbService: DbService);
    private validateEnv;
    private createOAuthClient;
    private getRefreshToken;
    private buildRawMessage;
    sendMail({ userId, to, subject, body, }: SendMailOptions): Promise<string>;
}
export {};
