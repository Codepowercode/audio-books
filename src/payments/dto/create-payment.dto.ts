import { IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  bookId: number;

  @IsNumber()
  @Min(10)
  amount: number;
}
