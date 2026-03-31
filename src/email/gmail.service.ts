import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { google } from 'googleapis';
import { DbService } from '../db/db.service';
import { decrypt } from '../util/crypto.util';

interface SendMailOptions {
  userId: number;
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class GmailService {
  constructor(private readonly dbService: DbService) {
    this.validateEnv();
  }

  private validateEnv() {
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REDIRECT_URL
    ) {
      throw new Error('Missing Google OAuth environment variables');
    }
  }

  private createOAuthClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL,
    );
  }

  private async getRefreshToken(userId: number): Promise<string> {
    const result = await this.dbService.executeQuery(
      `SELECT google_refresh_token FROM users WHERE id = $1`,
      [userId],
    );

    if (!result.length) {
      throw new UnauthorizedException(`User not found: ${userId}`);
    }

    const encryptedToken = result[0].google_refresh_token;

    if (!encryptedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return decrypt(encryptedToken);
  }

  private buildRawMessage(to: string, subject: string, body: string): string {
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=UTF-8',
      'MIME-Version: 1.0',
      '',
      body,
    ].join('\r\n');

    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async sendMail({
    userId,
    to,
    subject,
    body,
  }: SendMailOptions): Promise<string> {
    try {
      console.log(`📧 Sending email for user ${userId}`);

      const refreshToken = await this.getRefreshToken(userId);

      const oauth2Client = this.createOAuthClient();

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const accessToken = await oauth2Client.getAccessToken();

      if (!accessToken?.token) {
        throw new UnauthorizedException('Failed to generate access token');
      }

      const gmail = google.gmail({
        version: 'v1',
        auth: oauth2Client,
      });

      const rawMessage = this.buildRawMessage(to, subject, body);

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: rawMessage },
      });

      if (!response.data.id) {
        throw new InternalServerErrorException('Failed to send Gmail message');
      }

      console.log(`✅ Email sent → ${to}`);

      return response.data.id;
    } catch (error: any) {
      if (error.message?.includes('invalid_grant')) {
        console.error('❌ Refresh token expired');

        throw new UnauthorizedException(
          'Google authorization expired. Please reconnect Gmail.',
        );
      }

      console.error('❌ Gmail send failed:', error);

      throw new InternalServerErrorException(error.message);
    }
  }
}