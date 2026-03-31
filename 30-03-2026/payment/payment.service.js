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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("../db/db.service");
let PaymentService = class PaymentService {
    dbService;
    razorpay;
    constructor(dbService) {
        this.dbService = dbService;
    }
    async createOrder(amount, currency = 'INR') {
        const options = {
            amount: amount * 100,
            currency,
            receipt: `receipt_${Date.now()}`,
        };
        try {
            return await this.razorpay.orders.create(options);
        }
        catch (error) {
            console.error('Razorpay create order failed:', error);
            throw new common_1.HttpException('Failed to create payment order', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async processLicense(data) {
        const { email, first_name, last_name, product } = data;
        const user = await this.dbService.executeQuery(`SELECT id FROM users WHERE email=$1`, [email]);
        let userId;
        if (user.length) {
            userId = user[0].id;
        }
        else {
            const newUser = await this.dbService.executeQuery(`INSERT INTO users (email,first_name,last_name,role)
         VALUES ($1,$2,$3,'Testing')
         RETURNING id`, [email, first_name, last_name]);
            userId = newUser[0].id;
        }
        await this.dbService.executeQuery(`INSERT INTO licenses (user_id,product,status,created_at)
       VALUES ($1,$2,'active',NOW())`, [userId, product]);
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map