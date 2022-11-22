import { IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsOptional()
  nameEnglish: string;

  @IsOptional()
  nameArabic: string;

  @IsOptional()
  authorEnglish: string;

  @IsOptional()
  authorArabic: string;

  @IsNumber()
  yearOfPublishing: number;

  @IsNotEmpty()
  ISBN: string;

  @IsNumber()
  @Min(100)
  kickoffPledge: number;
}
