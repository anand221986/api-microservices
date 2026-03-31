export declare class GoogleAuthService {
    private client;
    verifyToken(token: string): Promise<import("google-auth-library").TokenPayload | undefined>;
}
