import type { LandUse } from "../types/land.type";

export interface RegisterLand{
    currentOwner: string,
    state: string,
    lga: string,
    area: number,
    landUse: LandUse,
    landIdOnChain: number
}

export interface RegisterLandOnChain{
    state: string,
    lga: string,
    area: number,
    landuse: LandUse,
    ipfs: string
}

export interface Land{
    state: string,
    lga: string,
    area: number,
    landUse: LandUse,
    landIdOnChain: number,
    registrationDate: Date
}

export interface LandResponse{
    id: string,
    currentOwner: string,
    state: string,
    lga: string,
    area: number,
    landUse: LandUse,
    isVerified: boolean,
    landIdOnChain: number,
    registrationDate: Date,
}

export interface BlockchainLandData {
    landId: bigint
    currentOwner: string
    state: string
    lga: string
    area: bigint
    isVerified: boolean
    landIpfs: string
    landUse: number
    lastTransferDate: bigint
    ownershipHistory: string[]
    registrationDate: bigint
    transferStatus: number
}

export interface VerificationResult {
    isAccurate: boolean
    mismatches: string[]
}
