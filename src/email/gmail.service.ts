import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  private oauth2Client;
  constructor(
    private readonly dbService: DbService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI,
    );

  }
  /**
   * Get and decrypt refresh token from DB
   */
  private async getDecryptedRefreshToken(
    userId: number,
  ): Promise<string> {
    const result = await this.dbService.executeQuery(`SELECT google_refresh_token FROM users WHERE id = $1`,[userId],
    );
    if (!result.length) {
      throw new UnauthorizedException(
        `User not found: ${userId}`,
      );
    }
    const encryptedToken = result[0].google_refresh_token;
    if (!encryptedToken) {
      throw new UnauthorizedException(
        `Refresh token not found`,
      );
    }
    // ✅ Decrypt here
    const refreshToken = decrypt(encryptedToken);
    return refreshToken;
  }
  /**
   * Refresh access token using decrypted refresh token
   */
  private async refreshAccessToken(
    userId: number,
  ): Promise<string> {
    const refreshToken =
      await this.getDecryptedRefreshToken(userId);

    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } =
      await this.oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new UnauthorizedException(
        'Failed to refresh access token',
      );
    }
    return credentials.access_token;
  }

  /**
   * Send mail
   */
  async sendMail({
    userId,
    to,
    subject,
    body,
  }: SendMailOptions): Promise<void> {

    const accessToken =
      await this.refreshAccessToken(userId);

      console.log( userId,
    to,
    subject,accessToken,'=================================================')

    this.oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const gmail = google.gmail({
      version: 'v1',
      auth: this.oauth2Client,
    });

    const message = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      body,
    ].join('\n');

    const encodedMessage = Buffer
      .from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

  }

}