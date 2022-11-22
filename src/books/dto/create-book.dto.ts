import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  nameEnglish: string;

  @IsNotEmpty()
  descriptionEnglish: string;

  @IsNotEmpty()
  nameArabic: string;

  @IsNotEmpty()
  descriptionArabic: string;

  @IsNotEmpty()
  authorEnglish: string;

  @IsNotEmpty()
  authorArabic: string;

  @IsString()
  narrator: string;

  @IsString()
  genre: string;

  @IsBoolean()
  issample: boolean;

  @IsNumber()
  @Min(100)
  kickoffPledge: number;

  @IsNumber()
  yearOfPublishing: number;

  @IsNotEmpty()
  ISBN: string;
}
