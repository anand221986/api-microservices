// email.worker.ts

import { Processor, WorkerHost, OnWorkerEvent, } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GmailService } from './gmail.service';
import { DbService } from '../db/db.service';

interface MailJobData {
    jobId: number;
    templateId: number;
}

interface MailResult {
    email: string;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
}

@Processor('mail-queue')
export class EmailWorker extends WorkerHost {

    constructor(
        private readonly gmailService: GmailService,
        private readonly dbService: DbService,
    ) {
        super();
    }
    @OnWorkerEvent('active')
    onActive(job: Job) {
        console.log(`🚀 Job picked by worker: ID=${job.id}, jobId=${job.data.jobId}`);
    }
    /**
    * ✅ Fires when job completes
    */
    @OnWorkerEvent('completed')
    onCompleted(job: Job, result: any) {
        console.log(`✅ Job completed: ID=${job.id}`);
        console.log(`Result:`, result);
    }

    /**
     * ✅ Fires when job fails
     */
    @OnWorkerEvent('failed')
    onFailed(job: Job, err: Error) {
        console.error(`❌ Job failed: ID=${job?.id}`);
        console.error(`Error:`, err.message);
    }

    /**
     * ✅ Fires when job progress updated
     */
    @OnWorkerEvent('progress')
    onProgress(job: Job, progress: number | object) {
        console.log(`📊 Job progress: ID=${job.id}`, progress);
    }

    /**
     * Replace template variables like {{name}}
     */
    private renderTemplate(
        template: string,
        variables: Record<string, string>,
    ): string {
        if (!template) return '';

        return template.replace(/{{(.*?)}}/g, (_, key) => {
            const value = variables?.[key.trim()];
            return value !== undefined && value !== null ? String(value) : '';
        });
    }

    /**
     * Worker process function
     */
    async process(job: Job<MailJobData>): Promise<MailResult[]> {

        const { jobId, templateId } = job.data;

        console.log(`📨 Processing mail job: ${jobId}`);

        const results: MailResult[] = [];

        try {

            /**
             * 1. Get template
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


            /**
             * 2. Get recipients
             */
            const recipients = await this.dbService.executeQuery(
                `SELECT email, variables FROM mail_merge_recipients WHERE job_id = $1`,
                [jobId],
            );

            if (!recipients?.length) {
                console.warn(`⚠️ No recipients found for job: ${jobId}`);
                return [];
            }


            /**
             * 3. Process each recipient
             */
            for (const recipient of recipients) {

                try {

                console.log('📝 Recipient variables raw:', recipient.variables);

        const variables = recipient.variables
            ? JSON.parse(recipient.variables)
            : {};

        console.log('✅ Parsed variables:', variables);

                    const finalSubject = this.renderTemplate(
                        subjectTemplate,
                        variables,
                    );

                    const finalBody = this.renderTemplate(
                        bodyTemplate,
                        variables,
                    );

                    console.log('✅ Parsed variables:', finalBody,finalSubject);
                    console.log({
                        userId: 87,
                        to: recipient.email,
                        subject: finalSubject,
                        body: finalBody,
                    })
                  

                    await this.gmailService.sendMail({
                        userId: 87,
                        to: recipient.email,
                        subject: finalSubject,
                        body: finalBody,
                    });

                    console.log(`✅ Email sent: ${recipient.email}`);

                    results.push({
                        email: recipient.email,
                        status: 'SUCCESS',
                    });

                } catch (error: any) {

                    console.error(
                        `❌ Failed to send email: ${recipient.email}`,
                        error.message,
                    );

                    results.push({
                        email: recipient.email,
                        status: 'FAILED',
                         error: JSON.stringify({
        message: JSON.stringify(error.message),
        stack: error.stack,
        ...(error.response ? { response: error.response.data || error.response } : {}),
    }),
                    });

                    /**
                     * Optional:
                     * Throw error if you want BullMQ retry
                     */
                    // throw error;
                }
            }


            /**
             * Optional: Update job status in DB
             */
            await this.dbService.executeQuery(
                `
        UPDATE mail_merge_jobs
        SET status = $1,
            completed_at = NOW()
        WHERE id = $2
        `,
                ['COMPLETED', jobId],
            );


            console.log(`🎉 Job completed: ${jobId}`);

            return results;

        } catch (error: any) {

            console.error(`🔥 Job failed: ${jobId}`, error.message);

            /**
             * Update job status as failed
             */
            await this.dbService.executeQuery(
                `
        UPDATE mail_jobs
        SET status = $1,
            error = $2,
            completed_at = NOW()
        WHERE id = $3
        `,
                ['FAILED', error.message, jobId],
            );

            /**
             * Throw error so BullMQ retry works
             */
            throw error;
        }
    }
}