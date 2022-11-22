import {
  IsBoolean,
  IsDateString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateUserInfoDto {
  // @IsNotEmpty()
  // @IsEmail()
  // email: string;

  @MinLength(8)
  @IsOptional()
  password: string;

  @IsOptional()
  name: string;

  @IsBoolean()
  @IsOptional()
  gender: boolean;

  @IsOptional()
  country: string;

  @IsDateString()
  @IsOptional()
  birthday: Date;
}
