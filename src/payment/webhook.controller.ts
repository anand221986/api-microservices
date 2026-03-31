import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('woocommerce')
  async handleWooCommerceWebhook(
    @Body() payload: any,
    @Headers() headers: any,
  ) {
    console.log('Webhook received');

    const email = payload.billing?.email;
    const name =
      payload.billing?.first_name + ' ' + payload.billing?.last_name;

    const products = payload.line_items || [];

    for (const item of products) {

      const product = item.sku || item.name;

      await this.paymentService.processLicense({
        email,
        name,
        product,
      });

    }

    return {
      success: true,
      message: 'Webhook processed successfully',
    };
  }
}