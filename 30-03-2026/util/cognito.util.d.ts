export declare class CognitoUtil {
    private readonly clientId;
    private readonly clientSecret;
    private cognitoClient;
    private userPoolId;
    constructor(userPoolId: string, region: string, clientId: string, clientSecret: string);
    formatPhoneE164(phone: string): string;
    updateCognitoUser(email: string, updates: {
        name?: string;
        phone_number?: string;
        status?: number;
        email_verified?: boolean;
        phone_verified: boolean;
    }): Promise<import("@aws-sdk/client-cognito-identity-provider").AdminUpdateUserAttributesCommandOutput>;
    assignUserToGroup(email: string, groupName: string): Promise<import("@aws-sdk/client-cognito-identity-provider").AdminAddUserToGroupCommandOutput>;
}
