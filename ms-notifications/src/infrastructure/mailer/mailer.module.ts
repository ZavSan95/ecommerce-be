import { Module } from '@nestjs/common';
import { MailerService } from 'src/infrastructure/mailer/mailer.service';

@Module({
  controllers: [],
  providers: [
    MailerService
  ],
  exports: [MailerService]
})
export class MailerModule {}
