import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('MAIL_HOST');
    const port = this.config.get<number>('MAIL_PORT');
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');
    const from = this.config.get<string>('MAIL_FROM');

    this.logger.log(`SMTP HOST: ${host}`);
    this.logger.log(`SMTP PORT: ${port}`);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
  }) {
    const info = await this.transporter.sendMail({
      from: this.config.get('MAIL_FROM'),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    this.logger.log(`📧 Email sent: ${info.messageId}`);
    return info;
  }

}