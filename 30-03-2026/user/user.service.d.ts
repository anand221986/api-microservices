import { DbService } from "../db/db.service";
import { UtilService } from "../util/util.service";
import { AuthService } from "../auth/auth.service";
import { UpdateUserDto, UpgradeUserDto } from './user.dto';
import { ConfigService } from "@nestjs/config";
export declare class UserService {
    private readonly configService;
    dbService: DbService;
    utilService: UtilService;
    AuthService: AuthService;
    private cognitoUtil;
    constructor(configService: ConfigService, dbService: DbService, utilService: UtilService, AuthService: AuthService);
    loginAdmin(req: any): Promise<{
        status: boolean;
        message: string;
        result: any;
    } | {
        status: boolean;
        message: any;
        error: string;
    }>;
    register(req: any): Promise<{
        status: boolean;
        message: string;
        result: any;
    } | {
        status: boolean;
        message: any;
        error: string;
    }>;
    getUserByEmail(email: any): Promise<any>;
    getUserByPhone(phone: any): Promise<any>;
    getAllUsers(): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    getUserById(id: number): Promise<any>;
    deleteUserById(id: number): Promise<{
        status: boolean;
        message: string;
        result: any;
    } | {
        status: boolean;
        message: any;
        error: string;
    }>;
    checkAdminUser(email: string, password: string): Promise<any>;
    getAllSalesEmployees(): Promise<{
        status: boolean;
        message: string;
        result: any;
    } | {
        status: boolean;
        message: any;
        error: string;
    }>;
    registerGoogleAuth(profile: any): Promise<any>;
    bulkDeleteCandidates(id: number | number[]): Promise<{
        status: boolean;
        message: string;
        result: any;
    } | {
        status: boolean;
        message: any;
        error: string;
    }>;
    bulkUpdateUser(ids: number[], updates: {
        field: string;
        action: string;
        value: any;
    }[]): Promise<{
        status: boolean;
        message: string;
        result: any;
    } | {
        status: boolean;
        message: any;
        error: string;
    }>;
    updateUser(id: number, body: Partial<UpdateUserDto>): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    createUser(req: any): Promise<{
        status: boolean;
        message: string;
        result: any;
    } | {
        status: boolean;
        message: any;
        error: string;
    }>;
    getUserPlan(userId: number): Promise<string>;
    isPro(userId: number): Promise<boolean>;
    upgradeUser(body: UpgradeUserDto): Promise<{
        success: boolean;
        message: string;
        user: {
            subscription: string;
            id: string;
        };
    }>;
    private getPlanAmount;
}
