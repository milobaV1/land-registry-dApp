import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { LandUse } from "../entities/land.entity";

export class CreateLandDto {
    @IsString()
    @IsNotEmpty()
    currentOwner: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    lga: string;

    @IsNumber()
    @IsNotEmpty()
    area: number

    @IsEnum(LandUse)
    landUse: LandUse

    @IsNumber()
    @IsNotEmpty()
    landIdOnChain: number
}


   