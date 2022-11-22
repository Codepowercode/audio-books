import {
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateBookDto {
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
  @IsOptional()
  narrator: string;

  @IsString()
  @IsOptional()
  genre: string;

  @IsBoolean()
  @IsOptional()
  issample: boolean;

  @IsNumber()
  @Min(100)
  kickoffPledge: number;

  @IsNumber()
  yearOfPublishing: number;

  @IsNotEmpty()
  ISBN: string;

  @IsNotEmpty()
  goal: number;

  @IsNotEmpty()
  deadline: Date;

  @IsNumber()
  status: number;

  @IsNumber()
  license: number;
}
