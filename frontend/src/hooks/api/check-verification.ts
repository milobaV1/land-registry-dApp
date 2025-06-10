import axios from "axios"

export const getKYCVerificationStatus = async (wallet_address: string) => {
    const response = await axios.get('http://localhost:3000/users/kycstatus', {
        params: {
            wallet_address
        }
    })
    console.log("verification check: ", response.data)
    return response.data
}


