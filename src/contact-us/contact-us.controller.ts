import { Controller, Get, Post, Body } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';

@Controller('contact-us')
export class ContactUsController {
  constructor(
    private readonly contactUsService: ContactUsService,
    private readonly mailsService: MailService,
  ) {}

  @Post('createmessage')
  async createMessage(@Body() createContactUsDto: CreateContactUsDto) {
    await this.contactUsService.create(createContactUsDto);
    const emailPayload = {
      name: createContactUsDto.name,
      email: createContactUsDto.email,
      message: createContactUsDto.message,
    };
    emailPayload['option'] = await this.contactUsService.getOptionById(
      createContactUsDto.option,
    );
    return await this.mailsService.sendMail(
      'nashir.platform@gmail.com',
      emailPayload,
      'Contact us',
      '/contact-us',
    );
  }

  @Get('getOptions')
  async getOptions() {
    return await this.contactUsService.getOptions();
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('setOptions')
  // setOptions(@Request() req) {
  //   ['technical support', 'report a bug', 'inquiry about adding your audiobook to our platform', 'join our team'].forEach(element => {
  //     ContactUsOptions.insert({
  //       'nameEnglish': element,
  //       'nameArabic': element
  //     })
  //   });
  // }
}
