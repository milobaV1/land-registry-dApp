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