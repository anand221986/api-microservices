"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoService = void 0;
const amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
const common_1 = require("@nestjs/common");
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;
if (!userPoolId || !clientId) {
    throw new Error('Missing required environment variables: COGNITO_USER_POOL_ID or COGNITO_CLIENT_ID');
}
const poolData = {
    UserPoolId: userPoolId,
    ClientId: clientId,
};
const userPool = new amazon_cognito_identity_js_1.CognitoUserPool(poolData);
let CognitoService = class CognitoService {
    async signUp(email, password, role) {
        const attributeList = [
            new amazon_cognito_identity_js_1.CognitoUserAttribute({ Name: 'email', Value: email }),
        ];
        return new Promise((resolve, reject) => {
            userPool.signUp(email, password, attributeList, [], (err, result) => {
                if (err)
                    return reject(err);
                resolve(result);
            });
        });
    }
    async signIn(email, password) {
        const authDetails = new amazon_cognito_identity_js_1.AuthenticationDetails({
            Username: email,
            Password: password,
        });
        const user = new amazon_cognito_identity_js_1.CognitoUser({
            Username: email,
            Pool: userPool,
        });
        return new Promise((resolve, reject) => {
            user.authenticateUser(authDetails, {
                onSuccess: (result) => resolve(result),
                onFailure: (err) => reject(err),
            });
        });
    }
};
exports.CognitoService = CognitoService;
exports.CognitoService = CognitoService = __decorate([
    (0, common_1.Injectable)()
], CognitoService);
//# sourceMappingURL=cognito.service.js.map