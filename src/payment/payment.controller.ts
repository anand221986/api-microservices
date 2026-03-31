// payment.controller.ts
import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  ForbiddenException,
  UseGuards,
  Headers,
  Body,
  HttpCode
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import * as crypto from 'crypto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response, @Headers() headers) {
    const signature = headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const body = JSON.stringify(req.body);
    // const expectedSignature = crypto
    //   .createHmac('sha256', secret)
    //   .update(body)
    //   .digest('hex');

    // if (signature !== expectedSignature) {
    //   throw new ForbiddenException('Invalid Razorpay signature');
    // }

    const event = req.body;

    if (event.event === 'payment.captured') {
      const paymentData = event.payload.payment.entity;
    //   await this.paymentService.saveTransaction(paymentData);
    //   await this.paymentService.sendConfirmation(paymentData);
    }

    return res.status(HttpStatus.OK).json({ received: true });
  }


@Post('woocommerce')
@HttpCode(200)
async handleWooCommerceWebhook(
  @Body() payload: any,
  @Headers() headers: any,
) {
  // console.log(payload,'Webhook received');
  const email = payload.billing?.email;
  const first_name = payload.billing?.first_name;
  const last_name = payload.billing?.last_name;
  const products = payload.line_items || [];
   const orderData = {
    order_id: payload.id,
    order_key: payload.order_key,
    customer_id: payload.customer_id,
    status: payload.status,
    total_amount: payload.total,
    currency: payload.currency,
    payment_method: payload.payment_method,
    payment_status: payload.status === 'completed', // important
    created_at: payload.date_created,
    line_items: payload.line_items || []
  };

  // console.log(email,
  //     first_name,
  //     last_name,
 
  //     orderData)
  //     return false;
  for (const item of products) {
    const product = item.sku || item.name;
    await this.paymentService.processLicense({
      email,
      first_name,
      last_name,
      item,
      orderData
    });
  }
  return {
    success: true,
    message: 'Webhook processed successfully',
  };
 
}
}
