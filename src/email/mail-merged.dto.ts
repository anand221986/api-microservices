import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsDate,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Sender DTO
 */
export class SenderDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsEmail()
  replyTo?: string;
}

/**
 * Recipient Variables DTO
 * Allows dynamic template variables like {{firstname}}, {{lastname}}
 */
export class RecipientVariablesDto {

  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  unsubscribe_link?: string;

  // allow dynamic variables
  [key: string]: any;
}

/**
 * Recipient DTO
 */
export class RecipientDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;
}

/**
 * Main DTO used to create mail merge job
 */
export class MailMergeSendDto {

  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsNumber()
  templateId: number;

  @IsOptional()
  @IsBoolean()
  trackEmails?: boolean;

  @ValidateNested()
  @Type(() => SenderDto)
  sender: SenderDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients: RecipientDto[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledAt?: Date;
}

/**
 * Internal DTO (used for advanced sending if needed)
 */
export class SendMailMergeDto {

  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsNumber()
  templateId: number;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @ValidateNested()
  @Type(() => SenderDto)
  sender: SenderDto;

  @IsOptional()
  @IsBoolean()
  trackEmails?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledAt?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients: RecipientDto[];
}