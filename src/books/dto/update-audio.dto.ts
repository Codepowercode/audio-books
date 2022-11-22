import { IsEmail, IsNotEmpty, IsNumber, Min, MinLength } from 'class-validator';

export class UpdateAudioDto {
  @IsNumber()
  id: number;

  // @IsNotEmpty()
  // title: string;

  // @IsNumber()
  // audioBookDuration: number;

  // @IsNotEmpty()
  // briefDescription: string;

  // @IsNotEmpty()
  // manualyTags: string;

  // @IsNotEmpty()
  // narrationCompanyName: string;

  // @IsNotEmpty()
  // narratorName: string;

  // @IsNotEmpty()
  // secondaryTitle: string;
  
}
