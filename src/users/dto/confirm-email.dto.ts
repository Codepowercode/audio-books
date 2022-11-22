import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class ConfirmEmailDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  verificationCode: string;
}
