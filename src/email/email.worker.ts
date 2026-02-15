import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GmailService } from './gmail.service';
import { DbService } from '../db/db.service';
import util from 'node:util';

interface MailJobData {
  jobId: number;
  templateId: number;
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
    const { jobId, templateId } = job.data;
    console.log(templateId)

    console.log(`📨 Processing mail job: ${jobId}`);

    try {
      /**
       * STEP 1: Load template
       */
      const templateResult = await this.dbService.executeQuery(
        `SELECT subject, body FROM mail_templates WHERE id = $1`,
        [templateId],
      );

      if (!templateResult?.length) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const subjectTemplate = templateResult[0].subject;
      const bodyTemplate = templateResult[0].body;

      console.log(`📄 Template loaded`);

      /**
       * STEP 2: Load recipients (only pending)
       */
      const recipients = await this.dbService.executeQuery(
        `
        SELECT id, email, variables
        FROM mail_merge_recipients
        WHERE job_id = $1
        AND status = 'PENDING'
        `,
        [jobId],
      );

      console.log(`👥 Recipients found: ${recipients.length}`);

      if (!recipients.length) {
        return;
      }

      /**
       * STEP 3: Process recipients in parallel (limit 5)
       */
      const concurrency = 5;

      for (let i = 0; i < recipients.length; i += concurrency) {
        const batch = recipients.slice(i, i + concurrency);

        await Promise.all(
          batch.map((recipient) =>
            this.processRecipient(
              recipient,
              subjectTemplate,
              bodyTemplate,
            ),
          ),
        );
      }

      /**
       * STEP 4: Mark job completed
       */
      await this.dbService.executeQuery(
        `
        UPDATE mail_merge_jobs
        SET status = 'COMPLETED',
            completed_at = NOW()
        WHERE id = $1
        `,
        [jobId],
      );

      console.log(`🎉 Job completed: ${jobId}`);
    } catch (error: any) {
      console.error(`🔥 JOB FAILED`, error);

      await this.dbService.executeQuery(
        `
        UPDATE mail_merge_jobs
        SET status = 'FAILED',
            error = $1,
            completed_at = NOW()
        WHERE id = $2
        `,
        [
          JSON.stringify({
            message: error.message,
            stack: error.stack,
          }),
          jobId,
        ],
      );

      throw error;
    }
  }

  /**
   * Process single recipient
   */
  private async processRecipient(
    recipient: any,
    subjectTemplate: string,
    bodyTemplate: string,
  ) {
    console.log(`📧 Sending → ${recipient.email}`);

    try {
      /**
       * Parse variables safely
       */
      let variables: Record<string, any> = {};

      if (recipient.variables) {
        if (typeof recipient.variables === 'object') {
          variables = recipient.variables;
        } else {
          variables = JSON.parse(recipient.variables);
        }
      }

      /**
       * Render templates
       */
      const subject = this.renderTemplate(subjectTemplate, variables);
      const body = this.renderTemplate(bodyTemplate, variables);

      /**
       * Send email with timeout protection
       */
      const messageId = await this.withTimeout(
        this.gmailService.sendMail({
          userId: 87,
          to: recipient.email,
          subject,
          body,
        }),
        30000,
      );

      /**
       * Update SUCCESS
       */
      await this.dbService.executeQuery(
        `
        UPDATE mail_merge_recipients
        SET status = 'SUCCESS',
            message_id = $1,
            error = NULL
        WHERE id = $2
        `,
        [messageId, recipient.id],
      );

      console.log(`✅ Sent → ${recipient.email}`);
    } catch (error: any) {
      console.error(`❌ Failed → ${recipient.email}`);

      await this.dbService.executeQuery(
        `
        UPDATE mail_merge_recipients
        SET status = 'FAILED',
            error = $1
        WHERE id = $2
        `,
        [
          JSON.stringify({
            message: error.message,
            stack: error.stack,
          }),
          recipient.id,
        ],
      );
    }
  }

  /**
   * Template renderer
   */
private renderTemplate(
  template: string,
  variables: Record<string, any>,
): string {

  try {

    // Validate template
    if (!template || typeof template !== 'string') {
      console.error('❌ renderTemplate: Invalid template', template);
      return '';
    }

    // Validate variables
    if (!variables || typeof variables !== 'object') {
      console.error('❌ renderTemplate: Invalid variables', variables);
      variables = {};
    }

    // Replace variables safely
    const result = template.replace(/{{(.*?)}}/g, (match, key) => {

      try {

        const cleanKey = key?.trim();

        if (!cleanKey) {
          console.warn(`⚠️ Empty template variable: ${match}`);
          return '';
        }

        const value = variables[cleanKey];

        if (value === undefined || value === null) {
          console.warn(`⚠️ Missing variable: ${cleanKey}`);
          return '';
        }

        return String(value);

      } catch (innerError) {

        console.error(
          `❌ Error replacing variable: ${match}`,
          innerError,
        );

        return '';
      }

    });

    return result;

  } catch (error) {

    console.error(
      '🔥 renderTemplate FAILED:',
      error,
      '\nTemplate:',
      template,
      '\nVariables:',
      variables,
    );

    return template || '';
  }
}

  /**
   * Timeout wrapper (prevents hanging)
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    ms: number,
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms),
    );

    return Promise.race([promise, timeout]);
  }
}