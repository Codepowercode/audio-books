import { IsEmail, IsNotEmpty, IsNumber, Min, MinLength } from 'class-validator';

export class CreateContactUsDto {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    message: string;

    @IsNumber()
    option: number;
}
