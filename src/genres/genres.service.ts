import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { QueryFailedError, TypeORMError } from 'typeorm';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenresService {
  async create(createGenreDto: CreateGenreDto) {
    try {
      const genre = await Genre.create(createGenreDto);

      await genre.save();
      return genre;
    } catch (err) {
      if (err instanceof QueryFailedError) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if (err.code === 'ER_DUP_ENTRY') {
          throw new BadRequestException('Genre already exists');
        }
      }

      throw err;
    }
  }

  async findAll() {
    return await Genre.find();
  }
}
