import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { UserService } from "../user/user.service";
import {
  CreateEmailSignatureDto,
  UpdateEmailSignatureDto,
} from './email-signature.dto';

@Injectable()
export class EmailSignatureService {
  constructor(
    private readonly dbService: DbService,
    private readonly utilService: UtilService,
    private usersService: UserService,
  ) {}

  // 📌 CREATE SIGNATURE
  async create(dto: CreateEmailSignatureDto) {
    try {
    const isPro = await this.usersService.isPro(dto.user_id);
    // const isPro = true;
    if (!isPro) {
      // Free plan allows only 1 signature
      const existingSignatures = await this.getSignatures(dto.user_id);
      if (existingSignatures.length >= 5) {
        throw new ForbiddenException('Free plan allows only 5 email signatures. Upgrade to Pro.');
      }
      else {
      // ✅ PRO USER → max 10 per day
      const todayCount = await this.getTodaySignatureCount(dto.user_id);

      if (todayCount >= 10) {
        throw new ForbiddenException(
          'Daily limit reached (10 signatures per day for Pro users)'
        );
      }
    }
    }
     const query = `INSERT INTO email_signatures(
    user_id, name, last_name, designation, company,
    phone, mobile, email, website, address,
    template_id, social_links, platform,
    logo_url, logo_base64, custom_html,is_default
  )
  VALUES
  ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
  RETURNING *;`;
    const values = [
  dto.user_id,
  dto.name,
  dto.lastName,
  dto.designation,
  dto.company,
  dto.phone,
  dto.mobile,
  dto.email,
  dto.website,
  dto.address,
  dto.templateId,
  dto.socialLinks ? JSON.stringify(dto.socialLinks) : null,
  dto.platform,
  dto.logo_url,
  dto.logoBase64,
  dto.custom_html,
 !!dto.is_default 
];
 const [signature] = await this.dbService.executeQuery(query, values);
 // 👉 increment count after successful creation
await this.incrementSignatureCount(dto.user_id);
      return this.utilService.successResponse(
        signature,
        'Email signature created successfully',
      );
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
      throw error; // rethrow 403, 400, etc
    }
      throw new InternalServerErrorException('Failed to create email signature');
    }
  }

  // 📌 UPDATE SIGNATURE
  async update(id: number, dto: UpdateEmailSignatureDto) {
    await this.findById(id);

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        fields.push(`${key} = $${index++}`);
        values.push(value);
      }
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE email_signatures
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *;
    `;

    // console.log(query,'console.log query')

    values.push(id);

    const [updated] = await this.dbService.executeQuery(query, values);

    return this.utilService.successResponse(
      updated,
      'Email signature updated successfully',
    );
  }

  // 📌 GET BY ID
  async findById(id: number) {
    const query = `SELECT *,logo_base64 as logoBase64 FROM email_signatures WHERE id = $1`;
    const result = await this.dbService.executeQuery(query, [id]);

    if (!result.length) {
      throw new NotFoundException('Email signature not found');
    }

    return result;
  }

  // 📌 GET BY USER
  async findByUser(userId: number) {
    const query = `
      SELECT *,logo_base64 as logoBase64 FROM email_signatures
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `;
    return this.dbService.executeQuery(query, [userId]);
  }

  // 📌 DELETE
  async delete(id: number) {
    const query = `DELETE FROM email_signatures WHERE id = $1 RETURNING *`;
    const result = await this.dbService.executeQuery(query, [id]);

    if (!result.length) {
      throw new NotFoundException('Email signature not found');
    }

    return this.utilService.successResponse(
      null,
      'Email signature deleted successfully',
    );
  }

  
    async getSignatures(userId: number) {
    const query = `SELECT  * FROM email_signatures WHERE user_id = $1`;
    const result = await this.dbService.executeQuery(query, [userId]);
  
    return result;
  }

  async incrementSignatureCount(userId: number) {
  try {
    const result = await this.dbService.executeQuery(`
      INSERT INTO email_limits (user_id, email_signatures_created_today, last_reset_date)
      VALUES ($1, 1, CURRENT_DATE)
      ON CONFLICT (user_id)
      DO UPDATE SET
        email_signatures_created_today = CASE
          WHEN email_limits.last_reset_date = CURRENT_DATE
          THEN email_limits.email_signatures_created_today + 1
          ELSE 1
        END,
        last_reset_date = CURRENT_DATE
      RETURNING *;
      `,
      [userId],
    );

    return result;
  } catch (error) {
    console.error('Error updating signature limits:', error);
    throw new Error('Failed to update signature limits');
  }
}
async getTodaySignatureCount(userId: number): Promise<number> {
  const query = `
    SELECT email_signatures_created_today, last_reset_date
    FROM email_limits
    WHERE user_id = $1
  `;

  const result = await this.dbService.executeQuery(query, [userId]);

  // 👉 If no record exists, create one
  if (result.length === 0) {
    await this.dbService.executeQuery(
      `INSERT INTO email_limits (user_id) VALUES ($1)`,
      [userId]
    );
    return 0;
  }

  const row = result[0];

  const today = new Date().toISOString().split("T")[0];

  // ✅ Reset if date changed
  if (row.last_reset_date !== today) {
    await this.dbService.executeQuery(
      `UPDATE email_limits
       SET email_signatures_created_today = 0,
           last_reset_date = CURRENT_DATE
       WHERE user_id = $1`,
      [userId]
    );

    return 0;
  }

  return Number(row.email_signatures_created_today);
}
}
