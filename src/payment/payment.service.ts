// payment.service.ts
import { Injectable, NotFoundException,HttpException,HttpStatus,InternalServerErrorException } from '@nestjs/common';
import Razorpay = require('razorpay');
import { DbService } from '../db/db.service';
import { AuthService } from "../auth/auth.service"
@Injectable()
export class PaymentService {
  private razorpay: Razorpay;
  
  constructor(private readonly dbService: DbService,public authService: AuthService,) {
    
    // this.razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_SECRET,
    // });
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

//processed licenses
//  async processLicense(data: any) {
//     const { email, first_name,last_name, product, orderData } = data;
//     // find user
//     const user = await this.dbService.executeQuery(
//       `SELECT id FROM users WHERE email=$1`,
//       [email],
//     );
//     let userId;
//     if (user.length) {
//       userId = user[0].id;
//     } else {
//       const newUser = await this.dbService.executeQuery(
//         `INSERT INTO users (email,first_name,last_name,role,plan)
//          VALUES ($1,$2,$3,'Testing','pro')
//          RETURNING id`,
//         [email, first_name,last_name],
//       );
//       userId = newUser[0].id;
//     }
//     // create license
//     await this.dbService.executeQuery(
//       `INSERT INTO licenses (user_id,product,status,created_at)
//        VALUES ($1,$2,'active',NOW())`,
//       [userId, product],
//     );



//   }

//processed licenses 

// async processLicense(data: any) {
 
//   const { email, first_name, last_name,item, orderData } = data;
//   const productName = item[0]?.name?.toLowerCase() || '';
//   // ✅ 1. FIND OR CREATE USER
//   const user = await this.dbService.executeQuery(
//     `SELECT id, plan FROM users WHERE email=$1`,
//     [email],
//   );

//   let userId;

//   if (user.length) {
//     userId = user[0].id;
//   } else {
//     const newUser = await this.dbService.executeQuery(
//       `INSERT INTO users (email, first_name, last_name, role, plan)
//        VALUES ($1,$2,$3,'user','free')
//        RETURNING id`,
//       [email, first_name, last_name],
//     );
//     userId = newUser[0].id;
//   }
//   // 💥 NEW: Create the blank email limits for the new Free user
//     await this.authService.createEmailLimits(userId);
//     // 2. Initialize the Subscription Plan (Plan = FREE, Limit = 20)
//   await this.authService.createUserPlan(userId, 'FREE');

//   // ✅ 2. GET PRODUCT INFO
//   // const item = orderData.line_items[0];


//   let plan_type = 'free';
//   let email_limit = 20;
//  let expiry_date: Date | null = null;

//   const now = new Date();

//   // ✅ 3. PLAN LOGIC (MONTHLY / YEARLY)
//   if (productName.includes('monthly')) {
//     plan_type = 'monthly';
//     email_limit = 1000;

//     const expiry = new Date(now);
//     expiry.setMonth(expiry.getMonth() + 1); // +1 month
//     expiry_date = expiry;

//   } else if (productName.includes('yearly')) {
//     plan_type = 'yearly';
//     email_limit = 1000;

//     const expiry = new Date(now);
//     expiry.setFullYear(expiry.getFullYear() + 1); // +1 year
//     expiry_date = expiry;
//   }

//   // ✅ 4. STORE ORDER
//   await this.dbService.executeQuery(
//     `INSERT INTO orders 
//     (order_id, order_key, customer_id, status, total_amount, currency, payment_method, payment_status, plan_type, email_limit, created_at, expiry_date)
//     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
//     ON CONFLICT (order_id) DO NOTHING`,
//     [
//       orderData.order_id,
//       orderData.order_key,
//       userId,
//       orderData.status,
//       orderData.total_amount,
//       orderData.currency,
//       orderData.payment_method,
//       orderData.status === 'completed',
//       plan_type,
//       email_limit,
//       orderData.created_at,
//       expiry_date
//     ],
//   );

//   // ✅ 5. ONLY ACTIVATE LICENSE IF PAYMENT SUCCESS
//   if (orderData.status === 'completed') {

//     // check existing license
//     const existingLicense = await this.dbService.executeQuery(
//       `SELECT id FROM licenses WHERE user_id=$1`,
//       [userId],
//     );

//     if (existingLicense.length) {
//       // ✅ UPDATE EXISTING LICENSE
//       await this.dbService.executeQuery(
//         `UPDATE licenses 
//          SET product=$1, status='active', expiry_date=$2, updated_at=NOW()
//          WHERE user_id=$3`,
//         [item?.name, expiry_date, userId],
//       );
//     } else {
//       // ✅ CREATE NEW LICENSE
//       await this.dbService.executeQuery(
//         `INSERT INTO licenses (user_id, product, status, expiry_date, created_at)
//          VALUES ($1,$2,'active',$3,NOW())`,
//         [userId, item?.name, expiry_date],
//       );
//     }

//     // // ✅ 6. UPDATE USER PLAN
//    await this.dbService.executeQuery(
//   `UPDATE users 
//    SET plan='pro' 
//    WHERE id=$1`,
//   [userId],
// );
//   }
// }

// customized function 
async processLicense(data: any) {
    const { email, first_name, last_name, item, orderData } = data;
    
    // WooCommerce sends line_items as an array; handle both possibilities safely
    const lineItem = Array.isArray(item) ? item[0] : item;
    const productName = lineItem?.name?.toLowerCase() || '';
    
    // Define success states for digital delivery
    const isPaymentSuccessful = 
      orderData.status === 'processing' || 
      orderData.status === 'completed';

    try {
      // 1. TRANSACTION START: Ensure all DB changes succeed or fail together
      await this.dbService.executeQuery('BEGIN');

      // 2. FIND OR CREATE USER (Upsert logic)
      let user = await this.dbService.executeQuery(
        `SELECT id FROM users WHERE email = $1`,
        [email]
      );

      let userId: number;

      if (user.length > 0) {
        userId = user[0].id;
      } else {
        const newUser = await this.dbService.executeQuery(
          `INSERT INTO users (email, first_name, last_name, role, plan)
           VALUES ($1, $2, $3, 'user', 'free')
           RETURNING id`,
          [email, first_name, last_name]
        );
        userId = newUser[0].id;

        // Initialize defaults for new users
        await this.authService.createEmailLimits(userId);
        await this.authService.createUserPlan(userId, 'FREE');
      }

      // 3. DETERMINE PLAN SPECS
      let plan_type = 'free';
      let email_limit = 20;
      let expiry_date: Date | null = null;
      const now = new Date();

      if (productName.includes('monthly')) {
        plan_type = 'monthly';
        email_limit = 1000;
        expiry_date = new Date(now.setMonth(now.getMonth() + 1));
      } else if (productName.includes('yearly')) {
        plan_type = 'yearly';
        email_limit = 1000;
        expiry_date = new Date(now.setFullYear(now.getFullYear() + 1));
      }

      // 4. UPSERT ORDER (Handle Idempotency)
      // We use ON CONFLICT to update the status if the webhook hits us again
      await this.dbService.executeQuery(
        `INSERT INTO orders 
        (order_id, order_key, customer_id, status, total_amount, currency, payment_method, payment_status, plan_type, email_limit, created_at, expiry_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (order_id) 
        DO UPDATE SET 
          status = EXCLUDED.status, 
          payment_status = EXCLUDED.payment_status,
          expiry_date = EXCLUDED.expiry_date`,
        [
          orderData.order_id,
          orderData.order_key,
          userId,
          orderData.status,
          orderData.total_amount,
          orderData.currency,
          orderData.payment_method,
          isPaymentSuccessful,
          plan_type,
          email_limit,
          orderData.created_at,
          expiry_date
        ]
      );

      // 5. LICENSE ACTIVATION (Only on Success)
      if (isPaymentSuccessful) {
        await this.dbService.executeQuery(
          `INSERT INTO licenses (user_id, product, status, expiry_date, created_at)
           VALUES ($1, $2, 'active', $3, NOW())
           ON CONFLICT (user_id) 
           DO UPDATE SET 
             product = EXCLUDED.product, 
             status = 'active', 
             expiry_date = EXCLUDED.expiry_date, 
             updated_at = NOW()`,
          [userId, lineItem?.name, expiry_date]
        );

        // Upgrade user plan level in main table
        await this.dbService.executeQuery(
          `UPDATE users SET plan = 'pro' WHERE id = $1`,
          [userId]
        );
        
        console.log(`Plan activated for User: ${userId}, Order: ${orderData.order_id}`);
      }

      // COMMIT TRANSACTION
      await this.dbService.executeQuery('COMMIT');

    } catch (error) {
      // ROLLBACK on any failure to prevent partial data
      await this.dbService.executeQuery('ROLLBACK');
      // this.logger.error(`Failed to process license for ${email}: ${error.message}`);
      throw new InternalServerErrorException('Payment processing failed');
    }
  }
}
