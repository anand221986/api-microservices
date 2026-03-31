import { Response } from "express";
import { AuthService } from "./auth.service";
import { UtilService } from 'src/util/util.service';
import { SignUpDto, SignInDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendMailDto } from './dto/send-mail.dto';
import { GoogleAuthService } from './google-auth.service';
import { GmailService } from './gmail.service';
export declare class AuthController {
    authService: AuthService;
    private utilService;
    private readonly googleAuthService;
    private readonly gmailService;
    private googleClient;
    private oAuth2Client;
    constructor(authService: AuthService, utilService: UtilService, googleAuthService: GoogleAuthService, gmailService: GmailService);
    signUp(signUpDto: SignUpDto): Promise<any>;
    signIn(signInDto: SignInDto): Promise<any>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any>;
    generateToken(): {
        access_token: string;
    };
    googleAuth(res: Response): Promise<void>;
    googleAuthRedirect(code: string, res: Response): Promise<void | Response<any, Record<string, any>>>;
    googleLogin(token: string): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: any;
            name: string;
            picture: string | undefined;
            role: any;
            subscription: any;
            products: any[];
            licenses: any[];
        };
    }>;
    googleCallback(req: any, res: any): Promise<any>;
    sendMailViaGmail(body: SendMailDto): Promise<{
        status: boolean;
        message: string;
    }>;
    getGoogleStatus(req: any): Promise<{
        connected: boolean;
    }>;
}
