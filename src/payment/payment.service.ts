// payment.service.ts
import { Injectable, NotFoundException,HttpException,HttpStatus } from '@nestjs/common';
import Razorpay = require('razorpay');
@Injectable()
export class PaymentService {
  private razorpay: Razorpay;
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }

  async createOrder(amount: number, currency = 'INR') {
    const options = {
      amount: amount * 100, // in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    try {
    return await this.razorpay.orders.create(options);
  }
 catch (error) {
    console.error('Razorpay create order failed:', error);
    throw new HttpException(
      'Failed to create payment order',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}
