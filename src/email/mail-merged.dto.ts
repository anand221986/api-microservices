import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SenderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}

class RecipientVariablesDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsString()
  unsubscribe_link: string;
}

class RecipientDto {
  @IsEmail()
  email: string;

  @IsObject()
  @ValidateNested()
  @Type(() => RecipientVariablesDto)
  variables: RecipientVariablesDto;
}

// export class MailMergeSendDto {
//   @IsString()
//   fileName: string;

//   @IsString()
//   templateId: string;

//   @ValidateNested()
//   @Type(() => SenderDto)
//   sender: SenderDto;

//   @IsBoolean()
//   trackEmails: boolean;

//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => RecipientDto)
//   recipients: RecipientDto[];
// }
export class MailMergeSendDto {
  @IsString()
  fileName: string;

  @IsString()
  templateId: string;

  @IsBoolean()
  trackEmails: boolean;

  @ValidateNested()
  @Type(() => SenderDto)
  sender: SenderDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients: RecipientDto[];
}
export class SendMailMergeDto {
  fileName: string;
  templateId: number;
  subject: string;
  template: string;

  sender: {
    name: string;
    email: string;
    replyTo?: string;
  };

  trackEmails?: boolean;
  scheduledAt?: Date;

  recipients: {
    email: string;
    variables: Record<string, any>;
  }[];
}

