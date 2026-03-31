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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("./auth.guard");
const auth_service_1 = require("./auth.service");
const google_auth_library_1 = require("google-auth-library");
const util_service_1 = require("../util/util.service");
const swagger_1 = require("@nestjs/swagger");
const signup_dto_1 = require("./dto/signup.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const send_mail_dto_1 = require("./dto/send-mail.dto");
const google_auth_service_1 = require("./google-auth.service");
const gmail_service_1 = require("./gmail.service");
const crypto_util_1 = require("../util/crypto.util");
let AuthController = class AuthController {
    authService;
    utilService;
    googleAuthService;
    gmailService;
    googleClient;
    oAuth2Client;
    constructor(authService, utilService, googleAuthService, gmailService) {
        this.authService = authService;
        this.utilService = utilService;
        this.googleAuthService = googleAuthService;
        this.gmailService = gmailService;
        this.googleClient = new google_auth_library_1.OAuth2Client();
        this.oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URL);
    }
    async signUp(signUpDto) {
        return this.authService.signUp(signUpDto);
    }
    async signIn(signInDto) {
        return this.authService.signIn(signInDto);
    }
    async forgotPassword(forgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto.email, resetPasswordDto.verificationCode, resetPasswordDto.newPassword);
    }
    generateToken() {
        const userId = 'default-user-id';
        const email = 'default@example.com';
        const token = this.authService.getToken(userId, email);
        return { access_token: token };
    }
    async googleAuth(res) {
        const authUrl = this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'openid',
                'email',
                'profile',
                'https://www.googleapis.com/auth/gmail.send',
            ],
            prompt: 'consent',
        });
        return res.redirect(authUrl);
    }
    async googleAuthRedirect(code, res) {
        if (!code) {
            return res.status(400).json({ error: 'Missing code parameter' });
        }
        try {
            const { tokens } = await this.oAuth2Client.getToken(code);
            const { access_token, refresh_token, expiry_date, id_token, } = tokens;
            if (!id_token) {
                return res.status(400).json({
                    error: 'Google ID token not received',
                });
            }
            const payload = await this.googleAuthService.verifyToken(id_token);
            if (!payload || !payload.email) {
                return res.status(400).json({
                    error: 'Invalid Google token payload',
                });
            }
            const email = payload.email;
            this.oAuth2Client.setCredentials(tokens);
            const user = await this.authService.findByEmail(email);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const encryptedRefreshToken = refresh_token
                ? (0, crypto_util_1.encrypt)(refresh_token)
                : user.google_refresh_token;
            await this.authService.updateUserGoogleTokens(user.id, {
                google_access_token: access_token,
                google_refresh_token: encryptedRefreshToken,
                google_token_expiry: expiry_date
                    ? new Date(expiry_date)
                    : null,
            });
            return res.redirect(`http://api.amyntasmedia.com/ams-tools-cms/connect-success`);
        }
        catch (error) {
            return res.status(500).json({ error: 'OAuth2 token exchange failed' });
        }
    }
    async googleLogin(token) {
        if (!token) {
            throw new common_1.BadRequestException('Google token missing');
        }
        const payload = await this.googleAuthService.verifyToken(token);
        if (!payload?.email) {
            throw new common_1.BadRequestException('Invalid Google token');
        }
        const { email, name = '', picture, sub: googleId, } = payload;
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');
        let user = await this.authService.findByEmail(email);
        if (!user) {
            const userCreatePayload = {
                first_name: firstName || '',
                last_name: lastName || '',
                email,
                phone: null,
                created_dt: new Date(),
                email_verified: 1,
                phone_verified: 0,
                password: null,
                google_id: googleId,
                role: 'Testing',
                agency_id: 0,
            };
            user = await this.authService.createUser(userCreatePayload);
        }
        user = await this.authService.findByEmail(email);
        const licenses = await this.authService.getUserLicenses(user.id);
        const accessToken = this.authService.generateJwt(user);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`.trim(),
                picture,
                role: user.role,
                subscription: user.plan,
                products: licenses.map(l => l.product),
                licenses: licenses,
            },
        };
    }
    async googleCallback(req, res) {
        const user = req.user;
        console.log(user, 'user details');
        const token = this.authService.generateTokens(user);
        return res.redirect(`http://localhost:8080/ams-tools-cms/google-success?token=${token}`);
    }
    async sendMailViaGmail(body) {
        const { accessToken, to, subject, html } = body;
        if (!accessToken) {
            throw new common_1.BadRequestException('Access token is required');
        }
        const result = await this.gmailService.sendMail(accessToken, to, subject, html);
        return {
            status: true,
            message: 'Email sent successfully',
        };
    }
    async getGoogleStatus(req) {
        console.log("REQ USER:", req.user);
        console.log("REQ HEADERS:", req.headers);
        const userId = req.user.userId;
        const user = await this.authService.findById(userId);
        return {
            connected: !!user.google_access_token,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user in Cognito and sync to DB' }),
    (0, swagger_1.ApiBody)({ type: signup_dto_1.SignUpDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User signed up successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Signup failed or input error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignUpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.Post)('signin'),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate user and return JWT tokens from Cognito' }),
    (0, swagger_1.ApiBody)({ type: signup_dto_1.SignInDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User signed in successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignInDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate password reset process' }),
    (0, swagger_1.ApiBody)({ type: forgot_password_dto_1.ForgotPasswordDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset code sent to email' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Failed to initiate password reset' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password using verification code' }),
    (0, swagger_1.ApiBody)({ type: reset_password_dto_1.ResetPasswordDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Failed to reset password' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('generate-token'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "generateToken", null);
__decorate([
    (0, common_1.Get)('google'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/redirect'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthRedirect", null);
__decorate([
    (0, common_1.Post)('google'),
    (0, swagger_1.ApiOperation)({ summary: 'Google SSO login' }),
    (0, swagger_1.ApiBody)({ schema: { example: { token: 'google-id-token' } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Google login success' }),
    __param(0, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.Post)('google/send-mail'),
    (0, swagger_1.ApiOperation)({ summary: 'Send email using Gmail API' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                accessToken: 'ya29.a0AfH6S...',
                to: 'test@example.com',
                subject: 'Hello from NestJS',
                html: '<h1>This email is sent via Gmail API</h1>',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_mail_dto_1.SendMailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendMailViaGmail", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)("google/status"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getGoogleStatus", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService, util_service_1.UtilService, google_auth_service_1.GoogleAuthService, gmail_service_1.GmailService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map