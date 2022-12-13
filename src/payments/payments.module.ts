import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [AuthModule, HttpModule],
})
export class PaymentsModule {}
