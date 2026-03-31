import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailMergeDto,UpdateEmailTemplateDto,CreateEmailTemplateDto,CreateMailMergeJobDto,MailMergeSendDto } from './mail-merge.dto';
import { UtilService } from '../util/util.service';
import { DbService } from '../db/db.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import * as fs from 'fs';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class MailService {
  constructor(
     @InjectQueue('mail-queue')
     private mailQueue: Queue,
    private readonly dbService: DbService,
    private readonly utilService: UtilService,
    private readonly mailerService: MailerService,
  ) { }

  async sendMailMerge(dto: SendMailMergeDto) {
    const results: Array<{
      email: string;
      status: 'SENT' | 'FAILED';
      error?: string;
    }> = [];

    for (const recipient of dto.recipients) {
      try {
        await this.mailerService.sendMail({
          to: recipient.email,
          subject: dto.subject,
          template: dto.template,
          context: recipient.data, // Mail-merge happens here
        });

        results.push({
          email: recipient.email,
          status: 'SENT',
        });
      } catch (error: any) {
        results.push({
          email: recipient.email,
          status: 'FAILED',
          error: error.message,
        });
      }
    }

    return {
      total: dto.recipients.length,
      results,
    };
  }

  //Process Csv 
  async processCsv(file, templateId) {
    const rows = await this.parseCsv(file.buffer);
    const template = await this.getTemplate(templateId);
    for (const row of rows) {
      try {
        const subject = this.replaceTemplate(template.subject, row);
        const body = this.replaceTemplate(template.body, row);
        await this.mailerService.sendMail({
          to: row.email,
          subject,
          html: body,
        });
        // log success
      } catch (err) {
        // log failure
      }
    }
    return { message: 'Mail merge completed' };
  }
async parseCsv(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error('CSV buffer is undefined'));
    }

    const results: any[] = [];

    Readable.from(buffer)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}


  replaceTemplate(template: string, data: Record<string, any>) {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
      return data[key.trim()] ?? '';
    });
  }
async getTemplate(templateId?: number) {
  let query = `
    SELECT id, name, subject, body, created_at
    FROM mail_templates
  `;

  const values: any[] = [];

  if (templateId !== undefined) {
    query += ` WHERE id = $1 LIMIT 1`;
    values.push(templateId);
  } else {
    query += ` ORDER BY created_at DESC`;
  }

  const result = await this.dbService.executeQuery(query, values);

  if (templateId !== undefined && !result.length) {
    throw new NotFoundException(
      `Mail template with id ${templateId} does not exist`,
    );
  }

  // ✔ If ID → return object
  // ✔ If no ID → return array
  return templateId !== undefined ? result[0] : result;
}

getTemplatebyuserId


  // 📌 Delete templates
  async deleteTemplates(id: number) {
    try {
      const query = 'DELETE FROM mail_templates WHERE id = $1 RETURNING *';
      const result = await this.dbService.executeQuery(query, [id]);
      if (result.length === 0) {
        throw new NotFoundException(`templates with ID ${id} not found`);
      }
      return this.utilService.successResponse(`templates with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting templates with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete templates');
    }
  }

   async updateTemplate(templateId: number, dto: UpdateEmailTemplateDto) {
    // 🔹 Check template exists
    await this.getTemplate(templateId);

    try {
      const fields: string[] = [];
      const values: any[] = [];
      let index = 1;

      if (dto.name !== undefined) {
        fields.push(`name = $${index++}`);
        values.push(dto.name);
      }

      if (dto.subject !== undefined) {
        fields.push(`subject = $${index++}`);
        values.push(dto.subject);
      }

      if (dto.body !== undefined) {
        fields.push(`body = $${index++}`);
        values.push(dto.body);
      }

      // 🔹 Always update timestamp
      fields.push(`updated_at = NOW()`);

      const query = `
        UPDATE mail_templates
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *;
      `;
      values.push(templateId);

      const result = await this.dbService.executeQuery(query, values);
      const updatedTemplate = result[0];

      // // 🔹 Optional: log template activity
      // await this.mailActivityService.createMailActivity(
      //   templateId,
      //   'UPDATED',
      //   dto.remark ?? 'Template updated',
      // );

      return this.utilService.successResponse(
        updatedTemplate,
        'Template updated successfully.',
      );
    } catch (error) {
      console.error('Error updating template:', error);
      throw new InternalServerErrorException('Failed to update template');
    }
  }

  async createTemplate(dto: CreateEmailTemplateDto) {
    const { name, subject, body,user_id } = dto;
    const query = `
      INSERT INTO mail_templates (name, subject, body,user_id, created_at)
      VALUES ($1, $2, $3,$4, NOW())
      RETURNING id, name, subject, body,user_id, created_at;
    `;
    const values = [name, subject, body,user_id];
    const result = await this.dbService.executeQuery(query, values);
    return result[0];
  }

  // Process CSV and track job in mail_merge_jobs
 
async processCsvFile(
  file: Express.Multer.File,
  templateId: number,
) {
  // 1️⃣ Read CSV file from disk as Buffer
  if (!file?.path) {
    throw new Error('Uploaded file path not found');
  }

  const buffer = fs.readFileSync(file.path);

  // 2️⃣ Parse CSV
  const rows = await this.parseCsv(buffer);
  const total = rows.length;

  if (!total) {
    throw new Error('CSV file is empty');
  }

  // 3️⃣ Fetch template
  const template = await this.getTemplate(templateId);

  // 4️⃣ Create mail merge job
  const [job] = await this.dbService.executeQuery(
    `
    INSERT INTO mail_merge_jobs (template_id, total, processed, status)
    VALUES ($1, $2, 0, 'PROCESSING')
    RETURNING id;
    `,
    [templateId, total],
  );

  let processed = 0;

  // 5️⃣ Process each CSV row
  for (const row of rows) {
    try {
      const subject = this.replaceTemplate(template.subject, row);
      const body = this.replaceTemplate(template.body, row);
      // await this.mailerService.sendMail({
      //   to: row.email,
      //   subject,
      //   html: body,
      // });

      // processed++;

      await this.dbService.executeQuery(
        `
        UPDATE mail_merge_jobs
        SET processed = $1
        WHERE id = $2;
        `,
        [processed, job.id],
      );
    } catch (error) {
      console.error(`Mail failed for ${row.email}`, error);
      // Optional: store failed rows in DB
    }
  }

  // 6️⃣ Mark job as completed
  await this.dbService.executeQuery(
    `
    UPDATE mail_merge_jobs
    SET status = 'COMPLETED'
    WHERE id = $1;
    `,
    [job.id],
  );

  // 7️⃣ Optional cleanup (recommended)
  fs.unlink(file.path, () => {});

  return {
    message: 'Mail merge completed',
    jobId: job.id,
    total,
    processed,
  };
}


async createJob(dto: CreateMailMergeJobDto) {
  const query = `
    INSERT INTO mail_merge_jobs
      (template_id, total, processed, status)
    VALUES
      ($1, $2, 0, 'PENDING')
    RETURNING *;
  `;
  const [job] = await this.dbService.executeQuery(query, [
    dto.template_id,
    dto.total,
  ]);

  return job;
}

 async getAllJobs(jobId?: number, userId?: number) {
  let query = `
    SELECT mmj.*, mt.name AS template_name
    FROM mail_merge_jobs mmj
    JOIN mail_templates mt ON mt.id = mmj.template_id
  `;
  
  const values: any[] = [];

  // Logic for filtering
  if (jobId) {
    query += ` WHERE mmj.id = $1 `;
    values.push(jobId);
  } else if (userId) {
    query += ` WHERE mmj.user_id = $1 `; // Assumes you have user_id in mail_merge_jobs
    values.push(userId);
  }

  query += ` ORDER BY mmj.created_at DESC `;

  // IMPORTANT: You must pass the 'values' array here!
  const result = await this.dbService.executeQuery(query, values);

  // Error handling for single record search
  if (jobId && result.length === 0) {
    throw new NotFoundException(`Mail job with id ${jobId} does not exist`);
  }

  return result;
}

  
  //delete Jobs
   async deleteJobs(id: number) {
    try {
      const query = 'DELETE FROM mail_merge_jobs WHERE id = $1 RETURNING *';
      const result = await this.dbService.executeQuery(query, [id]);
      const Query = 'DELETE FROM mail_merge_recipients WHERE id = $1 RETURNING *';
      const queryResult = await this.dbService.executeQuery( Query, [id]);
      if (result.length === 0) {
        throw new NotFoundException(`mail Merge Jobs with ID ${id} not found`);
      }
      return this.utilService.successResponse(`mail Merge with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting mail Merge with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete mail Merge');
    }
  }

    async createMailJob(body: MailMergeSendDto) {
    const job = await this.mailQueue.add(
      'send-mail',
      body,
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

    return job;

  }

  //getTemplates


  async getTemplates(userId?: number) {
  let query = `
    SELECT id, name, subject, body, created_at
    FROM mail_templates
  `;
  const values: any[] = [];
  if (userId !== undefined) {
    query += ` WHERE user_id = $1 `;
    values.push(userId);
  } else {
    query += ` ORDER BY created_at DESC`;
  }
  const result = await this.dbService.executeQuery(query, values);
  // if (userId !== undefined && !result.length) {
  //   throw new NotFoundException(
  //     `Mail template with id ${userId} does not exist`,
  //   );
  // }

  // ✔ If ID → return object
  // ✔ If no ID → return array
  return userId !== undefined ? result : result;
}


async getByJobId (jobId?: number) {

    const query = `
      SELECT 
        id,
        job_id,
        email,
        variables,
        status,
        error,
        message_id,
        error_message,
        created_at
      FROM mail_merge_recipients
      WHERE job_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.dbService.executeQuery(query, [jobId]);
    return result;

}

async getTemplateByUserId(userId: number) {
  // We filter by user_id to ensure private templates stay private
  const query = `
    SELECT id, name, subject, body, created_at, user_id
    FROM mail_templates
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;

  const values = [userId];

  try {
    const result = await this.dbService.executeQuery(query, values);

    // If a user has no templates, we return an empty array [] 
    // instead of throwing an error, so the UI doesn't crash.
    return result || []; 
  } catch (error) {
    console.error(`Error fetching templates for user ${userId}:`, error);
    throw new InternalServerErrorException('Failed to fetch user templates');
  }
}

async getUsagelimitByuserId(userId: number) {
    // SQL query targeting the columns from your provided schema
    const query = `
      SELECT 
        user_id, 
        emails_sent_today, 
        email_signatures_created_today, 
        last_reset_date 
      FROM public.email_limits 
      WHERE user_id = $1
    `;

    try {
      const result = await this.dbService.executeQuery(query, [userId]);

      // If the database returns an array, check if it has at least one row
      if (result && result.length > 0) {
        return result[0];
      }

      // Default fallback if no record exists for this user yet
      return {
        user_id: userId,
        emails_sent_today: 0,
        email_signatures_created_today: 0,
        last_reset_date: new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error(`Database error for user ${userId}:`, error);
      throw new InternalServerErrorException('Could not retrieve usage data from database');
    }
  }

}

 


