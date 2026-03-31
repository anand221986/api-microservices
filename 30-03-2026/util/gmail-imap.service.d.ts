import { DbService } from "../db/db.service";
import { UtilService } from "../util/util.service";
export declare class GmailImapService {
    dbService: DbService;
    utilService: UtilService;
    private oauth2Client;
    private readonly logger;
    constructor(dbService: DbService, utilService: UtilService);
    private readonly clientId;
    private readonly clientSecret;
    private readonly refreshToken;
    private readonly email;
    getAccessToken(): Promise<string>;
    getUserToken(userId: number): Promise<any>;
    ensureValidToken(userId: number, user: any): Promise<void>;
    getGoogleAuthUrl(userId: Number): any;
    syncEmail(userId: number): Promise<{
        id: string | null | undefined;
        threadId: string | null | undefined;
        subject: string;
        from: string;
        body: string;
    }[]>;
    startSyncJobAlter(userId: number): Promise<void>;
    handleOAuthCallback(code: string, userId: string): Promise<any>;
}
