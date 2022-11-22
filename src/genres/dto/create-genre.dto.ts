import { IsNotEmpty } from "class-validator";

export class CreateGenreDto {
    @IsNotEmpty()
    nameEnglish: string;

    @IsNotEmpty()
    nameArabic: string;
}
