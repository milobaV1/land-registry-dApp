import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator"

export class SearchLandDto{
    // @ApiPropertyOptional()
    // @IsOptional()
    // @IsString()
    // currentOwner?: string;

    // @ApiPropertyOptional()
    // @IsOptional()
    // @Type(() => Number)
    // @IsNumber()
    // landIdOnChain?: number;

    // @ApiPropertyOptional()
    // @IsOptional()
    // @IsString()
    // lga?: string;

    // @ApiPropertyOptional()
    // @IsOptional()
    // @IsString()
    // state?: string;

    // @ApiPropertyOptional()
    // @IsOptional()
    // @IsString()
    // search?: string;

    // @IsNotEmpty()
    // @Type(() => Number)
    // @IsNumber()
    // landIdOnChain: string;

    @IsString()
    @IsNotEmpty()
    currentOwner: string;

    @IsUUID()
    @IsNotEmpty()
    id: string;
}