import { IsDate, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { KYCStatus } from "../entities/user.entity";

export class CreateUserDto{
    @IsString()
    @IsNotEmpty()
    wallet_address: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsDate()
    @IsNotEmpty()
    dob: Date;

    @IsString()
    @IsNotEmpty()
    nin: string;

    @IsEnum(KYCStatus)
    kycstatus: KYCStatus
}