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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async handleWebhook(req, res, headers) {
        const signature = headers['x-razorpay-signature'];
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const body = JSON.stringify(req.body);
        const event = req.body;
        if (event.event === 'payment.captured') {
            const paymentData = event.payload.payment.entity;
        }
        return res.status(common_1.HttpStatus.OK).json({ received: true });
    }
    async handleWooCommerceWebhook(payload, headers) {
        console.log(payload,'Webhook received');
        const email = payload.billing?.email;
        const first_name = payload.billing?.first_name;
        const last_name = payload.billing?.last_name;
        const products = payload.line_items || [];
        for (const item of products) {
            const product = item.sku || item.name;
            await this.paymentService.processLicense({
                email,
                first_name,
                last_name,
                product,
            });
        }
        return {
            success: true,
            message: 'Webhook processed successfully',
        };
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('/webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('woocommerce'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleWooCommerceWebhook", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map