import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GmailService } from './gmail.service';
import { DbService } from '../db/db.service';

interface MailJobData {
  jobId: number;
  templateId: number;
  userId: number;
}

@Processor('mail-queue')
export class EmailWorker extends WorkerHost {
  constructor(
    private gmailService: GmailService,
    private dbService: DbService,
  ) {
    super();
  }

  async process(job: Job<MailJobData>): Promise<any> {
    const { jobId, templateId, userId } = job.data;

    console.log(`📨 Processing job: ${jobId}`);

    try {
      // ✅ Get template
      const template = await this.dbService.executeQuery(
        `SELECT subject, body FROM mail_templates WHERE id = $1`,
        [templateId],
      );

      if (!template.length) {
        throw new Error(`Template not found`);
      }

      const subjectTemplate = template[0].subject;
      const bodyTemplate = template[0].body;

      // ✅ Get recipients
      const recipients = await this.dbService.executeQuery(
        `
        SELECT r.id, r.email, r.variables, s.unsubscribe_token
        FROM mail_merge_recipients r
        INNER JOIN email_subscriptions s ON r.email = s.email
        WHERE r.job_id = $1
        AND r.status = 'PENDING'
        AND s.is_subscribed = TRUE
        `,
        [jobId],
      );

      console.log(`👥 Recipients: ${recipients.length}`);

      if (!recipients.length) return;

      const concurrency = 5;

      // ✅ Process in batches
      for (let i = 0; i < recipients.length; i += concurrency) {
        const batch = recipients.slice(i, i + concurrency);

        await Promise.all(
          batch.map((r) =>
            this.processRecipient(
              r,
              subjectTemplate,
              bodyTemplate,
              userId,
              jobId, // ✅ pass jobId
            ),
          ),
        );
      }

      // ✅ Mark job completed ONLY when all processed
      await this.dbService.executeQuery(
        `
        UPDATE mail_merge_jobs
        SET status = 'COMPLETED',
            completed_at = NOW()
        WHERE id = $1
        AND processed >= total
        `,
        [jobId],
      );

      console.log(`🎉 Job completed`);
    } catch (error) {
      console.error(`🔥 Job failed`, error);
      throw error;
    }
  }

  private async processRecipient(
    recipient: any,
    subjectTemplate: string,
    bodyTemplate: string,
    userId: number,
    jobId: number, // ✅ FIXED TYPE
  ) {
    console.log(`📧 Sending → ${recipient.email}`);

    try {
      let variables: Record<string, any> = {};

      if (recipient.variables) {
        try {
          variables =
            typeof recipient.variables === 'object'
              ? recipient.variables
              : JSON.parse(recipient.variables);
        } catch {
          variables = {};
        }
      }

      const subject = this.renderTemplate(subjectTemplate, variables);
      let body = this.renderTemplate(bodyTemplate, variables);

      const unsubscribeLink = `${process.env.API_URL}/unsubscribe?token=${recipient.unsubscribe_token}`;

      body += `
      <br><br>
      <hr>
      <p style="font-size:12px;color:gray;">
      If you don't want to receive these emails,
      <a href="${unsubscribeLink}">unsubscribe here</a>
      </p>
      `;

      // ✅ Send email
      const messageId = await this.gmailService.sendMail({
        userId,
        to: recipient.email,
        subject,
        body,
      });

      // ✅ Update success
      await this.dbService.executeQuery(
        `
        UPDATE mail_merge_recipients
        SET status='SUCCESS', message_id=$1, error_message=NULL
        WHERE id=$2
        `,
        [messageId, recipient.id],
      );
      // ✅ INSERT INTO email_logs (HERE 👇)
   await this.dbService.executeQuery(
  `INSERT INTO email_logs (user_id)
   VALUES ($1)
`,
  [userId],
);
try {
  const result = await this.dbService.executeQuery(
    `
    INSERT INTO email_limits (user_id, emails_sent_today, last_reset_date)
    VALUES ($1, 1, CURRENT_DATE)
    ON CONFLICT (user_id)
    DO UPDATE SET
      emails_sent_today = CASE
        WHEN email_limits.last_reset_date = CURRENT_DATE
        THEN email_limits.emails_sent_today + 1
        ELSE 1
      END,
      last_reset_date = CURRENT_DATE
    RETURNING *;
    `,
    [userId],
  );

  return result;
} catch (error) {
  console.error('Error updating email limits:', error);

  // Optional: throw custom exception (NestJS style)
  throw new Error('Failed to update email limits');
}
      console.log(`✅ Sent → ${recipient.email}`);
    } catch (error: any) {
      console.error(`❌ Failed → ${recipient.email}`);

      // ✅ Update failure
      await this.dbService.executeQuery(
        `
        UPDATE mail_merge_recipients
        SET status='FAILED', error_message=$1
        WHERE id=$2
        `,
        [
          JSON.stringify({
            message: error.message,
          }),
          recipient.id,
        ],
      );
    } finally {
      // ✅ ALWAYS increment processed count (KEY FIX)
      await this.dbService.executeQuery(
        `
        UPDATE mail_merge_jobs
        SET processed = processed + 1
        WHERE id = $1
        `,
        [jobId],
      );
    }
  }

  private renderTemplate(
    template: string,
    variables: Record<string, any>,
  ): string {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
      const value = variables[key.trim()];
      return value ? String(value) : '';
    });
  }
}