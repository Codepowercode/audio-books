import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NarratorsService } from './narrators.service';
import { CreateNarratorDto } from './dto/create-narrator.dto';
import { UpdateNarratorDto } from './dto/update-narrator.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('narrators')
export class NarratorsController {
  constructor(private readonly narratorsService: NarratorsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createNarratorDto: CreateNarratorDto, @Request() req) {
    return this.narratorsService.create(createNarratorDto, req.user);
  }

  @Get()
  findAll() {
    return this.narratorsService.findAll();
  }
}
