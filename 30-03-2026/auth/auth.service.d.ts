import { JwtService } from '@nestjs/jwt';
import { UtilService } from 'src/util/util.service';
import { ConfigService } from '@nestjs/config';
import { DbService } from "../db/db.service";
export declare class AuthService {
    private readonly config;
    private readonly jwtService;
    private readonly utilService;
    dbService: DbService;
    private ses;
    private readonly secretKey;
    private readonly apiKey;
    private readonly clientId;
    private readonly clientSecret;
    private readonly cognitoClient;
    constructor(config: ConfigService, jwtService: JwtService, utilService: UtilService, dbService: DbService);
    signUp(request: {
        email: string;
        password: string;
        name: string;
        phone_number: string;
        role: string;
        agency_id: number;
    }): Promise<any>;
    getToken(userId: any, userEmail: any): string;
    createUser(usercreatePayload: any): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    signIn(request: {
        email: string;
        password: string;
    }): Promise<any>;
    forgotPassword(email: string): Promise<any>;
    resetPassword(email: string, verificationCode: string, newPassword: string): Promise<any>;
    googleLogin(profile: any): Promise<{
        accessToken: string;
        user: any;
    }>;
    generateTokens(user: {
        id: number;
        email: string;
        role: string;
        agency_id?: number;
    }): {
        accessToken: string;
        refreshToken: string;
    };
    generateJwt(user: {
        id: number | string;
        email: string;
        name: string;
        first_name: string;
        last_name: string;
        role?: string | string[];
    }): string;
    findByEmail(email: string): Promise<any>;
    findById(userId: number): Promise<any>;
    updateUserGoogleTokens(userId: number, payload: {
        google_access_token?: string | null;
        google_refresh_token?: string;
        google_token_expiry?: Date | null;
    }): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    getUserLicenses(userId: number): Promise<any[]>;
}
