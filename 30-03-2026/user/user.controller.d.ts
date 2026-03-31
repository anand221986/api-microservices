import { Response } from "express";
import { UserService } from "./user.service";
import { UpdateUserDto, CreateUserDto, UpgradeUserDto } from './user.dto';
import { LoginAdminDto, BulkDeleteCandidateDto, BulkUpdateCandidateDto } from "./user.dto";
export declare class UserController {
    service: UserService;
    constructor(service: UserService);
    loginAdmin(body: LoginAdminDto, res: Response): Promise<Response<any, Record<string, any>>>;
    register(body: any, res: Response): Promise<void>;
    getAllUsers(res: Response): Promise<void>;
    getUserById(id: number, res: Response): Promise<void>;
    updateUser(id: number, body: UpdateUserDto, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteUser(id: number, res: Response): Promise<void>;
    bulkDeleteCandidates(body: BulkDeleteCandidateDto, res: Response): Promise<Response<any, Record<string, any>>>;
    bulkUpdateCandidates(body: BulkUpdateCandidateDto, res: Response): Promise<Response<any, Record<string, any>>>;
    createUser(body: CreateUserDto): Promise<{
        status: boolean;
        message: string;
        result: any;
    } | {
        status: boolean;
        message: any;
        error: string;
    }>;
    upgradeUser(body: UpgradeUserDto): Promise<{
        success: boolean;
        message: string;
        user: {
            subscription: string;
            id: string;
        };
    }>;
}
