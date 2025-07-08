import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator"

export class SearchLandDto{
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    currentOwner?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    landIdOnChain?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    lga?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}