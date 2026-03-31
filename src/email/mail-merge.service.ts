import {
   ForbiddenException,
  
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UserService } from '../user/user.service';
import { MailMergeSendDto } from './mail-merged.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import * as crypto from 'crypto';

@Injectable()
export class MailMergeService {

  constructor(
    private readonly dbService: DbService,
    private readonly userService: UserService,

    @InjectQueue('mail-queue')
    private mailQueue: Queue,
  ) { }

  async sendMailMerge(payload: MailMergeSendDto) {

    if (!payload.userId) {
      throw new Error('userId is required');
    }

    const recipientCount = payload.recipients.length;

    /**
     * 1️⃣ Insert Mail Job
     */

    const insertJobQuery = `
      INSERT INTO mail_merge_jobs (
        user_id,
        template_id,
        total,
        processed,
        status,
        file_name,
        sender_name,
        sender_email,
        reply_to,
        track_emails,
        scheduled_at
      )
      VALUES (
        $1, $2, $3, 0, 'PENDING',
        $4, $5, $6, $7, $8, $9
      )
      RETURNING id, user_id;
    `;

    const [job] = await this.dbService.executeQuery(insertJobQuery, [
      payload.userId,
      payload.templateId,
      recipientCount,
      payload.fileName,
      payload.sender.name,
      payload.sender.email,
      payload.sender.email,
      payload.trackEmails,
      payload.scheduledAt,
    ]);

    const jobId = job.id;

    /**
     * 2️⃣ Insert Recipients
     */

    const insertRecipientQuery = `
      INSERT INTO mail_merge_recipients (
        job_id,
        email,
        variables,
        status
      )
      VALUES ($1, $2, $3, 'PENDING')
    `;

    const insertSubscriptionQuery = `
      INSERT INTO email_subscriptions (
        email,
        unsubscribe_token,
        is_subscribed,
        subscribed_at
      )
      VALUES ($1, $2, TRUE, NOW())
      ON CONFLICT (email)
      DO NOTHING
    `;

    for (const recipient of payload.recipients) {

      await this.dbService.executeQuery(insertRecipientQuery, [
        jobId,
        recipient.email,
        JSON.stringify(recipient.variables || {}),
      ]);

      const unsubscribeToken = crypto.randomBytes(32).toString('hex');

      await this.dbService.executeQuery(insertSubscriptionQuery, [
        recipient.email,
        unsubscribeToken,
      ]);
    }

    return {
      message: 'Mail merge job created successfully',
      jobId,
      templateId: payload.templateId,
      userId: payload.userId,
      totalRecipients: recipientCount,
      status: 'PENDING',
    };
  }

async startMailMerge(payload: MailMergeSendDto) {
  try {
    console.log('🚀 startMailMerge triggered');
    console.log('📩 Payload:', payload);

    /**
     * 1️⃣ Basic Validation
     */
    if (!payload.userId) {
      console.error('❌ Missing userId');
      throw new Error('userId is required');
    }

    const recipientCount = payload.recipients.length;
    console.log('👥 Total recipients:', recipientCount);

    /**
     * 2️⃣ Check Plan
     */
    const isPro = await this.userService.isPro(payload.userId);
    const DAILY_LIMIT = isPro ? 1000 : 20;

    console.log('💳 User Plan:', isPro ? 'PRO' : 'FREE');
    console.log('📊 Daily Limit:', DAILY_LIMIT);

    /**
     * 3️⃣ Fetch Usage (🔥 FIXED - DB handles date)
     */
    const [usage] = await this.dbService.executeQuery(
      `
      SELECT 
        CASE 
          WHEN last_reset_date = CURRENT_DATE 
          THEN emails_sent_today 
          ELSE 0 
        END AS emails_sent_today
      FROM email_limits
      WHERE user_id = $1
      `,
      [payload.userId],
    );

    console.log('📦 Usage from DB (after date check):', usage);

    const emailsSentToday = usage?.emails_sent_today || 0;

    console.log('📨 Emails sent today:', emailsSentToday);

    /**
     * 4️⃣ Limit Check
     */
    const totalAfterSend = emailsSentToday + recipientCount;

    console.log('🧮 Total after this job:', totalAfterSend);

    if (totalAfterSend > DAILY_LIMIT) {
      console.error('❌ Limit exceeded!', {
        limit: DAILY_LIMIT,
        used: emailsSentToday,
        trying: recipientCount,
      });

      throw new ForbiddenException(
        `Daily email limit exceeded. Limit: ${DAILY_LIMIT}, Used: ${emailsSentToday}.Please upgrade your Plan.`,
      );
    }

    /**
     * 5️⃣ Save Job + Recipients
     */
    console.log('📝 Creating DB job...');
    const jobData = await this.sendMailMerge(payload);

    console.log('✅ DB Job created:', jobData);

    /**
     * 6️⃣ Add Job To Redis Queue
     */
    console.log('📥 Adding job to Redis queue...');

    const redisJob = await this.mailQueue.add(
      'send-mail',
      {
        jobId: jobData.jobId,
        templateId: jobData.templateId,
        userId: jobData.userId,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    /**
     * 7️⃣ Logs
     */
    console.log('✅ Redis Job Created Successfully');
    console.log('🆔 Redis Job ID:', redisJob.id);

    return {
      message: 'Mail merge job created and queued',
      jobId: jobData.jobId,
      redisJobId: redisJob.id,
      totalRecipients: jobData.totalRecipients,
    };

  } catch (error) {
    console.error('❌ Error in startMailMerge:', error);

    if (error?.response) {
      console.error('📛 Error Response:', error.response);
    }

    throw error;
  }
}

  //sendScheduledemail
  async sendScheduledemail(payload: MailMergeSendDto) {
    try {
     const jobData = await this.sendMailMerge(payload);
      return {
      message: 'Scheduled Job created successfully',
      result:jobData
      };
    }
    catch (error) {
      console.error('❌ Error inserting job into Redis:', error);
      throw error;
    }
  }

   async sendScheduledMailMerge(payload: MailMergeSendDto) {

    if (!payload.userId) {
      throw new Error('userId is required');
    }

    const recipientCount = payload.recipients.length;

    /**
     * 1️⃣ Insert Mail Job
     */

    const insertJobQuery = `
      INSERT INTO mail_merge_jobs (
        user_id,
        template_id,
        total,
        processed,
        status,
        file_name,
        sender_name,
        sender_email,
        reply_to,
        track_emails,
        scheduled_at
      )
      VALUES (
        $1, $2, $3, 0, 'PENDING',
        $4, $5, $6, $7, $8, $9
      )
      RETURNING id, user_id;
    `;

    const [job] = await this.dbService.executeQuery(insertJobQuery, [
      payload.userId,
      payload.templateId,
      recipientCount,
      payload.fileName,
      payload.sender.name,
      payload.sender.email,
      payload.sender.email,
      payload.trackEmails,
      null,
    ]);

    const jobId = job.id;

    /**
     * 2️⃣ Insert Recipients
     */

    const insertRecipientQuery = `
      INSERT INTO mail_merge_recipients (
        job_id,
        email,
        variables,
        status
      )
      VALUES ($1, $2, $3, 'PENDING')
    `;

    const insertSubscriptionQuery = `
      INSERT INTO email_subscriptions (
        email,
        unsubscribe_token,
        is_subscribed,
        subscribed_at
      )
      VALUES ($1, $2, TRUE, NOW())
      ON CONFLICT (email)
      DO NOTHING
    `;

    for (const recipient of payload.recipients) {

      await this.dbService.executeQuery(insertRecipientQuery, [
        jobId,
        recipient.email,
        JSON.stringify(recipient.variables || {}),
      ]);

      const unsubscribeToken = crypto.randomBytes(32).toString('hex');

      await this.dbService.executeQuery(insertSubscriptionQuery, [
        recipient.email,
        unsubscribeToken,
      ]);
    }

    return {
      message: 'Mail merge job created successfully',
      jobId,
      templateId: payload.templateId,
      userId: payload.userId,
      totalRecipients: recipientCount,
      status: 'PENDING',
    };
  }

}