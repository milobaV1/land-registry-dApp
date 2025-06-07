import axios from "axios"

export const verifyNonce = async (prepared: string, signature: any) => {
    const response
     = await axios.post('http://localhost:3000/auth/verify', {
        message: prepared,
        signature,
     });

     return response.data
}