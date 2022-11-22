import { Module } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { StatusesController } from './statuses.controller';

@Module({
  controllers: [StatusesController],
  providers: [StatusesService],
})
export class StatusesModule {}
