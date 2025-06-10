import type { UserInterface } from "@/service/interface/nin.interface";
import axios from "axios";

export async function createUser(data: UserInterface){
    const response = await axios.post('http://localhost:3000/users/create', data)
    return response.data
}
