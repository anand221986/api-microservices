import { PaymentService } from './payment.service';
export declare class WebhookController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    handleWooCommerceWebhook(payload: any, headers: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
