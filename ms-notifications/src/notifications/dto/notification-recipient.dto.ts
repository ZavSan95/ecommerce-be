import { IsEmail, IsOptional, IsString } from 'class-validator';

export class NotificationRecipientDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  telegramId?: string;
}
