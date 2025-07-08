import type { RegisterLand } from "@/service/interface/land.interface";
import axios from "axios";

export async function registerLandOffChain(data: RegisterLand){
    const response = await axios.post('http://localhost:3000/lands', data)
    return response.data
}