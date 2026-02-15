import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { Expose,Type } from 'class-transformer';
export class CreateEmailSignatureDto {
  @IsOptional()
  @Type(() => Number)
  user_id: number;
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };

  @IsOptional()
  @IsString()
  platform?: string;

  @Expose({ name: 'logoUrl' })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @Expose({ name: 'logoBase64' })
  @IsOptional()
  @IsString()
  logoBase64?: string;

  @Expose({ name: 'customHTML' })
  @IsOptional()
  @IsString()
  custom_html?: string;

  @IsOptional()
  @IsInt()
  id?: number;
  @IsOptional()
  is_default?:boolean;
}

export class UpdateEmailSignatureDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  logoBase64?: string;

  @IsOptional()
  @IsString()
  custom_html?: string;

  @IsOptional()
  @IsString()
  template_id?: string;

  // ⚠️ must be stringified JSON
  @IsOptional()
  social_links?: {
    twitter?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  @IsOptional()
  @IsString()
  platform?: string;
  @IsOptional()
  id:number;
  @IsOptional()
  user_id:number;

  @IsOptional()
  @IsString()
  mobile?: string;
  @IsOptional()
  is_default?:boolean;

}