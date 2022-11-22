import { Module } from '@nestjs/common';
import { NarratorsService } from './narrators.service';
import { NarratorsController } from './narrators.controller';

@Module({
  controllers: [NarratorsController],
  providers: [NarratorsService],
})
export class NarratorsModule {}
