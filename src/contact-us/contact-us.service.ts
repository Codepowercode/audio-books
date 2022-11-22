import { Injectable } from '@nestjs/common';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { ContactUsOptions } from './entities/contact-us-options.entity';
import { ContactUs } from './entities/contact-us.entity';

@Injectable()
export class ContactUsService {
  async create(createContactUsDto: CreateContactUsDto) {
    const newContact = await ContactUs.create(createContactUsDto);
    await newContact.save();
  }

  async getOptions() {
    return await ContactUsOptions.find();
  }

  async getOptionById(id: number) {
    var x = await ContactUsOptions.findOne({
      id: id
    });

    return x['nameEnglish'];
  }
}
