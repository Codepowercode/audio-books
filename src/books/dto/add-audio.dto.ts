import { IsNumber } from 'class-validator';

export class AddAudioDto {
  @IsNumber()
  id: number;
}
