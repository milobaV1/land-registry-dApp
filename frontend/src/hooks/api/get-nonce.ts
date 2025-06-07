import axios from "axios"

export const getNonce = async () => {
    const response = await axios.get('http://localhost:3000/auth/nonce', {withCredentials:true})
    return response.data;
}