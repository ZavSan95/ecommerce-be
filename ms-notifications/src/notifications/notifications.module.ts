import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MailerModule } from 'src/infrastructure/mailer/mailer.module';

@Module({
  imports: [
    MailerModule
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
  ],
})
export class NotificationsModule {}
