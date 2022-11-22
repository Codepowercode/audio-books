import { Module } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [ContactUsController],
  providers: [ContactUsService, MailService],
  imports: [MailService]
})
export class ContactUsModule {}
