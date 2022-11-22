import { Body, Controller, Post, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  //deprecated
  
  // @Post('send')
  // async sendEmail(@Body('email') email, @Body('verificationCode') verificationCode) {
  //   return await this.mailService.sendMail(email, verificationCode);
  // }
}
