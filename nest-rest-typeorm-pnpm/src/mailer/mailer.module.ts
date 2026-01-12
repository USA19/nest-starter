import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendGridMailer } from './send-grid-provider';

@Module({
  imports: [],
  providers: [MailerService, SendGridMailer],
  exports: [MailerService, SendGridMailer]
})
export class MailerModule { }
