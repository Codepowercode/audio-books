import { PartialType } from '@nestjs/mapped-types';
import { CreateNarratorDto } from './create-narrator.dto';

export class UpdateNarratorDto extends PartialType(CreateNarratorDto) {}
