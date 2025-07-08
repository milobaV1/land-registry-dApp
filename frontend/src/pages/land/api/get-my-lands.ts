import type { LandResponse } from "@/service/interface/land.interface";
import axios from "axios";

export async function getUserLands(address: string): Promise<LandResponse[] | undefined> {
    const response = await axios.get(`http://localhost:3000/lands/get-land-by-address/${address}`)
    return response.data as LandResponse[]
}