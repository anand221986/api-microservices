import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailMergeDto } from './mail-merged.dto';
import { UtilService } from '../util/util.service';
import { DbService } from '../db/db.service';
import {  MailMergeSendDto } from './mail-merged.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
@Injectable()
export class MailMergeService {
  constructor(private readonly dbService: DbService, @InjectQueue('mail-queue')
     private mailQueue: Queue,) {}

  async sendMailMerge(payload: MailMergeSendDto) {
    const recipientCount = payload.recipients.length;
    /** 1️⃣ Insert Job */
    const insertJobQuery = `
      INSERT INTO mail_merge_jobs (
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
        $1, $2, 0, 'pending',
        $3, $4, $5, $6, $7, $8
      )
      RETURNING id;
    `;
    const [job] = await this.dbService.executeQuery(insertJobQuery, [
      payload.templateId,
      recipientCount,
      payload.fileName,
      payload.sender.name,
      payload.sender.email,
      payload.sender.email, // reply_to (optional override)
      payload.trackEmails,
      null, // scheduled_at (future use)
    ]);
    const jobId = job.id;
    /** 2️⃣ Insert Recipients */
    const insertRecipientQuery = `
      INSERT INTO mail_merge_recipients (
        job_id,
        email,
        variables,
        status
      )
      VALUES ($1, $2, $3, 'PENDING');
    `;
    for (const recipient of payload.recipients) {
      await this.dbService.executeQuery(insertRecipientQuery, [
        jobId,
        recipient.email,
        JSON.stringify(recipient.variables),
      ]);
    }
    /** 3️⃣ Response */
    return {
      message: 'Mail merge job created successfully',
      jobId,
      templateId:payload.templateId,
      totalRecipients: recipientCount,
      status: 'PENDING',
    };
  }
  async startMailMerge(payload: MailMergeSendDto) {
  /** 1️⃣ Save job + recipients in DB */
  const jobData = await this.sendMailMerge(payload);
  /** 2️⃣ Add to queue */
  await this.mailQueue.add(
    'send-mail',
    {
      jobId: jobData.jobId,
      templateId:jobData.templateId
    },
    {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  return {
    message: 'Mail merge job created and queued',
    jobId: jobData.jobId,
    totalRecipients: jobData.totalRecipients
  };
}
}