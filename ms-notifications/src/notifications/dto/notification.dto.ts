import { IsEnum, IsObject, IsOptional, ValidateNested } from "class-validator";
import { NotificationChannel } from "./enum-channels.dto";
import { NotificationRecipientDto } from "./notification-recipient.dto";
import { Type } from "class-transformer";

export class SendNotificationDto {

    @IsEnum(NotificationChannel)
    channel: NotificationChannel;
    
    @ValidateNested()
    @Type(() => NotificationRecipientDto)
    to: NotificationRecipientDto;

    @IsOptional()
    @IsObject()
    data?: Record<string, any>;
}