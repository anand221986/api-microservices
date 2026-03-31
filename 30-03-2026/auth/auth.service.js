"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt = require("jsonwebtoken");
const util_service_1 = require("../util/util.service");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const db_service_1 = require("../db/db.service");
const bcrypt = require("bcrypt");
const client_sesv2_1 = require("@aws-sdk/client-sesv2");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
let AuthService = class AuthService {
    config;
    jwtService;
    utilService;
    dbService;
    ses;
    secretKey;
    apiKey;
    clientId;
    clientSecret;
    cognitoClient;
    constructor(config, jwtService, utilService, dbService) {
        this.config = config;
        this.jwtService = jwtService;
        this.utilService = utilService;
        this.dbService = dbService;
        const userPoolId = this.config.get('COGNITO_USER_POOL_ID');
        this.clientId = this.config.get('COGNITO_CLIENT_ID');
        this.clientSecret = this.config.get('COGNITO_CLIENT_SECRET');
        this.secretKey = this.config.get('JWT_SECRET') || '';
        this.apiKey = this.config.get('API_KEY') || '';
        if (!userPoolId || !this.clientId || !this.clientSecret) {
            throw new Error('Missing Cognito config values');
        }
        this.ses = new client_sesv2_1.SESv2Client({
            region: this.config.get('AWS_REGION') || "eu-north-1",
        });
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: this.config.get('AWS_REGION') || 'eu-north-1',
            credentials: {
                accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
            },
        });
    }
    async signUp(request) {
        const { email, password, name, phone_number, role, agency_id } = request;
        const secretHash = this.utilService.generateSecretHash(email, this.clientId, this.clientSecret);
        const hashedPassword = await bcrypt.hash(password, 10);
        const command = new client_cognito_identity_provider_1.SignUpCommand({
            ClientId: this.clientId,
            Username: email,
            Password: password,
            SecretHash: secretHash,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: request.email,
                },
                {
                    Name: 'name',
                    Value: request.name,
                },
                {
                    Name: 'phone_number',
                    Value: "+917043097908",
                },
            ],
        });
        try {
            const response = await this.cognitoClient.send(command);
            const confirmCommand = new client_cognito_identity_provider_1.AdminConfirmSignUpCommand({
                UserPoolId: this.config.get('COGNITO_USER_POOL_ID'),
                Username: email,
            });
            let confirmResult = await this.cognitoClient.send(confirmCommand);
            console.log('Cognito user confirmed successfully:', confirmResult);
            const groupName = role;
            const addToGroupCommand = new client_cognito_identity_provider_1.AdminAddUserToGroupCommand({
                UserPoolId: this.config.get('COGNITO_USER_POOL_ID'),
                Username: email,
                GroupName: groupName,
            });
            await this.cognitoClient.send(addToGroupCommand);
            console.log(`User added to group "${groupName}"`);
            try {
                const getCmd = new client_sesv2_1.GetEmailIdentityCommand({
                    EmailIdentity: email,
                });
                const result = await this.ses.send(getCmd);
                console.log(result, 'result');
                if (result.VerificationStatus === "PENDING") {
                    console.log(`⌛ ${email} verification is still pending.`);
                }
                if (result.VerificationStatus === "FAILED") {
                    console.log(`${email} verification failed. You may need to re-verify.`);
                }
                console.log(`${email} status: ${result.VerificationStatus}`);
            }
            catch (sesErr) {
                if (sesErr.name === "AlreadyExistsException") {
                    console.log("Email identity already exists, skipping verification");
                }
                if (sesErr.name !== "NotFoundException") {
                    try {
                        const verifyCmd = new client_sesv2_1.CreateEmailIdentityCommand({
                            EmailIdentity: email,
                        });
                        await this.ses.send(verifyCmd);
                        console.log(`📧 SESv2 verification email sent to ${email}`);
                    }
                    catch (createErr) {
                        console.error(`❌ SES verification failed for ${email}`, createErr);
                    }
                    console.error(`Failed to check email identity for ${email}`, sesErr);
                }
            }
            const [firstName, ...lastNameParts] = name.split(' ');
            const lastName = lastNameParts.join(' ');
            const usercreatePayload = {
                first_name: firstName,
                last_name: lastName || '',
                email,
                phone: phone_number,
                created_dt: new Date(),
                email_verified: 0,
                phone_verified: 0,
                password: hashedPassword,
                cognitoId: response.UserSub,
                role: role,
                agency_id: agency_id
            };
            return await this.createUser(usercreatePayload);
        }
        catch (error) {
            if (error.name === 'UsernameExistsException') {
                throw new common_1.BadRequestException('User already exists');
            }
            throw new common_1.BadRequestException(error.message || 'Signup failed');
        }
    }
    getToken(userId, userEmail) {
        const tokenCreationTime = Math.floor(Date.now() / 1000);
        const jti = (0, uuid_1.v4)();
        const payload = {
            iss: this.apiKey,
            iat: tokenCreationTime,
            jti: jti,
            sub: userId,
            email: userEmail
        };
        const token = jwt.sign(payload, this.secretKey);
        return token;
    }
    async createUser(usercreatePayload) {
        try {
            const setData = [
                { set: 'first_name', value: String(usercreatePayload.first_name) },
                { set: 'last_name', value: String(usercreatePayload.last_name) },
                { set: 'email', value: String(usercreatePayload.email) },
                { set: 'password', value: String(usercreatePayload.password ?? '') },
                { set: 'phone', value: String(usercreatePayload.phone_number ?? '') },
                { set: 'role', value: String(usercreatePayload.role ?? '') },
                { set: 'agency_id', value: String(usercreatePayload.agency_id ?? '') },
            ];
            const insertion = await this.dbService.insertData('users', setData);
            return this.utilService.successResponse(insertion, 'User created successfully.');
        }
        catch (error) {
            console.error('Create User Error:', error);
            throw error;
        }
    }
    async signIn(request) {
        const { email, password } = request;
        const users = await this.dbService.execute(`SELECT
      id,
      first_name,
      last_name,
      email,
      password,
      agency_id,
      status,role,plan

    FROM users
    WHERE email = '${email}'
    LIMIT 1
  `);
        if (!users || users.length === 0) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const user = users[0];
        if (user.status !== 1) {
            throw new common_1.UnauthorizedException('User is not active');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        const hash = await bcrypt.hash('Admin@123', 10);
        console.log(hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password1');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            agency_id: user.agency_id,
            subscription: user.plan,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '1h',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
            agency_id: Number(user.agency_id),
            role: user.role,
            id: Number(user.id),
        };
    }
    async forgotPassword(email) {
        const secretHash = this.utilService.generateSecretHash(email, this.clientId, this.clientSecret);
        const command = new client_cognito_identity_provider_1.ForgotPasswordCommand({
            ClientId: this.clientId,
            Username: email,
            SecretHash: secretHash,
        });
        try {
            const response = await this.cognitoClient.send(command);
            return {
                success: true,
                message: 'Password reset code sent to your email',
                codeDeliveryDetails: response.CodeDeliveryDetails
            };
        }
        catch (err) {
            console.error('Cognito forgot password error:', err);
            throw new common_1.BadRequestException(err.message || 'Failed to initiate password reset');
        }
    }
    async resetPassword(email, verificationCode, newPassword) {
        const secretHash = this.utilService.generateSecretHash(email, this.clientId, this.clientSecret);
        const command = new client_cognito_identity_provider_1.ConfirmForgotPasswordCommand({
            ClientId: this.clientId,
            Username: email,
            ConfirmationCode: verificationCode,
            Password: newPassword,
            SecretHash: secretHash,
        });
        try {
            await this.cognitoClient.send(command);
            return {
                success: true,
                message: 'Password has been reset successfully'
            };
        }
        catch (err) {
            console.error('Cognito reset password error:', err);
            throw new common_1.BadRequestException(err.message || 'Failed to reset password');
        }
    }
    async googleLogin(profile) {
        const { email, given_name, family_name, sub } = profile;
        const users = await this.dbService.executeQuery(`
    SELECT
      id,
      first_name,
      last_name,
      email,
      role,
      status,
      google_id,
      provider
    FROM users
    WHERE email = $1
    LIMIT 1
  `, [email]);
        let user = users?.[0];
        if (!user) {
            const insertResult = await this.dbService.executeQuery(`
      INSERT INTO users (
        email,
        first_name,
        last_name,
        google_id,
        provider,
        status,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        email,
        first_name,
        last_name,
        role,
        status
    `, [
                email,
                given_name || '',
                family_name || '',
                sub,
                'google',
                1,
                'user',
            ]);
            user = insertResult[0];
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user,
        };
    }
    generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            agency_id: user.agency_id,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '1h',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    generateJwt(user) {
        const payload = {
            sub: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role ?? "USER",
        };
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: "1h",
        });
    }
    async findByEmail(email) {
        const users = await this.dbService.execute(`SELECT
      id,
      first_name,
      last_name,
      email,
      password,
      agency_id,
      status,role
    FROM users
    WHERE email = '${email}'
    LIMIT 1
  `);
        return users?.length ? users[0] : null;
    }
    async findById(userId) {
        const query = `SELECT id, first_name, last_name, email, password, agency_id, status, role, google_access_token, google_refresh_token, google_token_expiry FROM users WHERE id = ${Number(userId)} LIMIT 1`;
        const users = await this.dbService.execute(query);
        return users?.length ? users[0] : null;
    }
    async updateUserGoogleTokens(userId, payload) {
        try {
            const fields = [];
            const values = [];
            let index = 1;
            if (payload.google_access_token !== undefined) {
                fields.push(`google_access_token = $${index++}`);
                values.push(payload.google_access_token);
            }
            if (payload.google_refresh_token !== undefined) {
                fields.push(`google_refresh_token = $${index++}`);
                values.push(payload.google_refresh_token);
            }
            if (payload.google_token_expiry !== undefined) {
                fields.push(`google_token_expiry = $${index++}`);
                values.push(payload.google_token_expiry);
            }
            if (!fields.length) {
                return this.utilService.successResponse(null, 'No Google token fields provided for update.');
            }
            fields.push(`updated_dt = NOW()`);
            const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *;
    `;
            values.push(userId);
            const result = await this.dbService.executeQuery(query, values);
            if (!result || !result.length) {
                throw new common_1.NotFoundException('User not found');
            }
            const updatedUser = result[0];
            return this.utilService.successResponse(updatedUser, 'User Google tokens updated successfully.');
        }
        catch (error) {
            console.error('Error updating Google tokens:', error);
            throw error instanceof common_1.NotFoundException
                ? error
                : new common_1.InternalServerErrorException('Failed to update Google tokens');
        }
    }
    async getUserLicenses(userId) {
        const query = `SELECT product, status, expiry_date FROM licenses  WHERE user_id = $1 AND status = 'active'`;
        const result = await this.dbService.executeQuery(query, [userId]);
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        util_service_1.UtilService,
        db_service_1.DbService])
], AuthService);
//# sourceMappingURL=auth.service.js.map