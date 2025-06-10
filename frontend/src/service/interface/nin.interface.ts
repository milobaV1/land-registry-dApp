import type { KYCStatus } from "../types/kyc.type"

export interface NINInterface{
    nin: string,
    dob: string,
    firstname: string,
    lastname: string
}


export interface UserInterface{
    wallet_address: string | undefined,
    firstName: string,
    lastName: string,
    dob: Date,
    nin: string,
    kycstatus: KYCStatus
}    