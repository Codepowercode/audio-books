import { IsOptional, IsString, Min } from 'class-validator';

export class UpdateDonatedBookDto {
  @IsOptional()
  nameEnglish: string;

  @IsOptional()
  descriptionEnglish: string;

  @IsOptional()
  nameArabic: string;

  @IsOptional()
  descriptionArabic: string;

  @IsOptional()
  authorEnglish: string;

  @IsOptional()
  authorArabic: string;

  @IsOptional()
  narrator: string;

  @IsOptional()
  genre: string;

  @IsOptional()
  kickoffPledge: number;

  @IsOptional()
  yearOfPublishing: number;

  @IsOptional()
  ISBN: string;

  @IsOptional()
  goal: number;

  @IsOptional()
  deadline: Date;

  @IsOptional()
  status: number;

  @IsOptional()
  license: number;

  @IsOptional()
  title: string;

  @IsOptional()
  audioBookDuration: number;

  @IsOptional()
  briefDescription: string;

  @IsOptional()
  manualyTags: string;

  @IsOptional()
  narrationCompanyName: string;

  @IsOptional()
  narratorName: string;

  @IsOptional()
  secondaryTitle: string;
}
