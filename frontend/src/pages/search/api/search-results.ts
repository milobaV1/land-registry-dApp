import type { LandResponse } from "@/service/interface/land.interface";
import type { Search } from "@/service/interface/search.interface";
import axios from "axios";

export async function searchLand(params: Search): Promise<LandResponse[]>{
    const response = await axios.get('http://localhost:3000/lands/search-and-filter',
        {
            params,
        }

        
    )
    return response.data
}