// gmail.service.ts
import { Injectable } from "@nestjs/common";
import { google } from "googleapis";

@Injectable()
export class GmailService {
  async sendMail(
    accessToken: string,
    to: string,
    subject: string,
    html: string
  ) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth });

    const messageParts = [
      `To: ${to}`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      `Subject: ${subject}`,
      "",
      html,
    ];

    const message = Buffer.from(messageParts.join("\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: message,
      },
    });
  }
}