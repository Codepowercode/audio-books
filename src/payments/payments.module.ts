import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [AuthModule]
})
export class PaymentsModule {}
