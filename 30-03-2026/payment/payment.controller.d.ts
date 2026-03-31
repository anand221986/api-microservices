import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    handleWebhook(req: Request, res: Response, headers: any): Promise<Response<any, Record<string, any>>>;
    handleWooCommerceWebhook(payload: any, headers: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
