import { Module } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';

@Module({
  controllers: [LicensesController],
  providers: [LicensesService],
})
export class LicensesModule {}
