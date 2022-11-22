import { IsNotEmpty } from "class-validator";

export class CreateNarratorDto {
    @IsNotEmpty()
    nameEnglish: string;

    @IsNotEmpty()
    nameArabic: string;
}
