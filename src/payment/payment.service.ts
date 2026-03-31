// payment.service.ts
import { Injectable, NotFoundException,HttpException,HttpStatus } from '@nestjs/common';
import Razorpay = require('razorpay');
import { DbService } from '../db/db.service';
@Injectable()
export class PaymentService {
  private razorpay: Razorpay;
  
  constructor(private readonly dbService: DbService) {
    
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

async processLicense(data: any) {

  console.log(data);
 
  const { email, first_name, last_name,item, orderData } = data;
  const productName = item[0]?.name?.toLowerCase() || '';
  // ✅ 1. FIND OR CREATE USER
  const user = await this.dbService.executeQuery(
    `SELECT id, plan FROM users WHERE email=$1`,
    [email],
  );

  let userId;

  if (user.length) {
    userId = user[0].id;
  } else {
    const newUser = await this.dbService.executeQuery(
      `INSERT INTO users (email, first_name, last_name, role, plan)
       VALUES ($1,$2,$3,'user','free')
       RETURNING id`,
      [email, first_name, last_name],
    );
    userId = newUser[0].id;
  }

  // ✅ 2. GET PRODUCT INFO
  // const item = orderData.line_items[0];


  let plan_type = 'free';
  let email_limit = 20;
 let expiry_date: Date | null = null;

  const now = new Date();

  // ✅ 3. PLAN LOGIC (MONTHLY / YEARLY)
  if (productName.includes('monthly')) {
    plan_type = 'monthly';
    email_limit = 1000;

    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 1); // +1 month
    expiry_date = expiry;

  } else if (productName.includes('yearly')) {
    plan_type = 'yearly';
    email_limit = 1000;

    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1); // +1 year
    expiry_date = expiry;
  }

  // ✅ 4. STORE ORDER
  await this.dbService.executeQuery(
    `INSERT INTO orders 
    (order_id, order_key, customer_id, status, total_amount, currency, payment_method, payment_status, plan_type, email_limit, created_at, expiry_date)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    ON CONFLICT (order_id) DO NOTHING`,
    [
      orderData.order_id,
      orderData.order_key,
      userId,
      orderData.status,
      orderData.total_amount,
      orderData.currency,
      orderData.payment_method,
      orderData.status === 'completed',
      plan_type,
      email_limit,
      orderData.created_at,
      expiry_date
    ],
  );

  // ✅ 5. ONLY ACTIVATE LICENSE IF PAYMENT SUCCESS
  if (orderData.status === 'completed') {

    // check existing license
    const existingLicense = await this.dbService.executeQuery(
      `SELECT id FROM licenses WHERE user_id=$1`,
      [userId],
    );

    if (existingLicense.length) {
      // ✅ UPDATE EXISTING LICENSE
      await this.dbService.executeQuery(
        `UPDATE licenses 
         SET product=$1, status='active', expiry_date=$2, updated_at=NOW()
         WHERE user_id=$3`,
        [item?.name, expiry_date, userId],
      );
    } else {
      // ✅ CREATE NEW LICENSE
      await this.dbService.executeQuery(
        `INSERT INTO licenses (user_id, product, status, expiry_date, created_at)
         VALUES ($1,$2,'active',$3,NOW())`,
        [userId, item?.name, expiry_date],
      );
    }

    // // ✅ 6. UPDATE USER PLAN
   await this.dbService.executeQuery(
  `UPDATE users 
   SET plan='pro' 
   WHERE id=$1`,
  [userId],
);
  }
}
}
