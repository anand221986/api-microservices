import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendMailDto {
  @IsNotEmpty()
  accessToken: string;

  @IsEmail()
  to: string;

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  html: string;
}