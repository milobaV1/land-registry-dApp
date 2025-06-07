import type { NINInterface } from '@/service/interface/nin.interface'
import axios from 'axios'
export async function verifyNIN(data: NINInterface){
    const {nin, dob, firstname, lastname} = data;
    const response = await axios.post(`https://vapi.verifyme.ng/v1/verifications/identities/nin/${nin}`,{
        dob,
        firstname,
        lastname
    })

    return response.data
}