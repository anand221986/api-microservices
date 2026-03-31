import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { UserService } from "../user/user.service";
import { CreateEmailSignatureDto, UpdateEmailSignatureDto } from './email-signature.dto';
export declare class EmailSignatureService {
    private readonly dbService;
    private readonly utilService;
    private usersService;
    constructor(dbService: DbService, utilService: UtilService, usersService: UserService);
    create(dto: CreateEmailSignatureDto): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    update(id: number, dto: UpdateEmailSignatureDto): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    findById(id: number): Promise<any[]>;
    findByUser(userId: number): Promise<any[]>;
    delete(id: number): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    getSignatures(userId: number): Promise<any[]>;
}
