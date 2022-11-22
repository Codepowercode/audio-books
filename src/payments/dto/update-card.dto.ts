import { IsEmail, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

export class UpdateCardDto {
  @IsNumber()
  cardNumber: number;

  @IsNotEmpty()
  cardExpiring: string;

  @IsNumber()
  cardCVV: number;

  @IsNotEmpty()
  cardOwner: string;
}
