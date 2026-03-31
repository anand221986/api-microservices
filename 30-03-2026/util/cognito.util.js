"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoUtil = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
class CognitoUtil {
    clientId;
    clientSecret;
    cognitoClient;
    userPoolId;
    constructor(userPoolId, region, clientId, clientSecret) {
        console.log(clientId, clientSecret, userPoolId, clientSecret);
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.userPoolId = userPoolId;
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({ region });
        if (!userPoolId || !this.clientId || !this.clientSecret) {
            throw new Error('Missing Cognito config values');
        }
    }
    formatPhoneE164(phone) {
        if (!phone)
            return phone;
        if (phone.startsWith('+'))
            return phone;
        return `+91${phone}`;
    }
    async updateCognitoUser(email, updates) {
        const attributes = [];
        if (updates.name) {
            attributes.push({ Name: "name", Value: updates.name });
        }
        if (updates.phone_number) {
            attributes.push({ Name: "phone_number", Value: this.formatPhoneE164(updates.phone_number) });
        }
        if (updates.status !== undefined) {
            attributes.push({ Name: "custom:status", Value: String(updates.status) });
        }
        if (updates.status !== undefined) {
            attributes.push({ Name: "custom:status", Value: String(updates.status) });
        }
        if (updates.email_verified !== undefined) {
            attributes.push({
                Name: "email_verified",
                Value: updates.email_verified ? "true" : "false",
            });
        }
        const command = new client_cognito_identity_provider_1.AdminUpdateUserAttributesCommand({
            UserPoolId: this.userPoolId,
            Username: email,
            UserAttributes: attributes,
        });
        return await this.cognitoClient.send(command);
    }
    async assignUserToGroup(email, groupName) {
        const command = new client_cognito_identity_provider_1.AdminAddUserToGroupCommand({
            UserPoolId: this.userPoolId,
            Username: email,
            GroupName: groupName,
        });
        return await this.cognitoClient.send(command);
    }
}
exports.CognitoUtil = CognitoUtil;
//# sourceMappingURL=cognito.util.js.map