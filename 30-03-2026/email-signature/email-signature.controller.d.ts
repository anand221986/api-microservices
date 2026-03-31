import { EmailSignatureService } from './email-signature.service';
import { CreateEmailSignatureDto, UpdateEmailSignatureDto } from './email-signature.dto';
export declare class EmailSignatureController {
    private readonly service;
    constructor(service: EmailSignatureService);
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
}
