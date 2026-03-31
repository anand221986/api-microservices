import { DbService } from '../db/db.service';
export declare class PaymentService {
    private readonly dbService;
    private razorpay;
    constructor(dbService: DbService);
    createOrder(amount: number, currency?: string): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    processLicense(data: any): Promise<void>;
}
