import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNarratorDto } from './dto/create-narrator.dto';
import { UpdateNarratorDto } from './dto/update-narrator.dto';
import { Narrator } from './entities/narrator.entity';

@Injectable()
export class NarratorsService {
  async create(createNarratorDto: CreateNarratorDto, user: { userId: number; userName: string; userRole: string },) {
    try {
      if(user.userRole != 'administrator') {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'You are not an administrator',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      return await Narrator.create(createNarratorDto);
    }
    catch(error) {

    }
  }

  async findAll() {
    return await Narrator.find();
  }
}
