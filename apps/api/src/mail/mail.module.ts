import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ResendModule } from './resend.module';
import { EmailTemplateService } from './email-template.service';

@Module({
  imports: [ConfigModule, ResendModule],
  controllers: [MailController],
  providers: [MailService, EmailTemplateService],
  exports: [MailService],
})
export class MailModule {}
