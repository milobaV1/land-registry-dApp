import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { KYC_CONTRACT_ADDRESS, KYC_CONTRACT_ABI } from '@/contracts/config/index'

export function useKYCContract(){
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const submitKYC = async (
        address: string,
        ninHash: string,
        photoCID: string
    ) => {
        console.log('Address: ', address)
        console.log('ninHash: ', ninHash)
        console.log('photoCID: ', photoCID)
        const writeToContract = writeContract({
            address: KYC_CONTRACT_ADDRESS,
            abi: KYC_CONTRACT_ABI,
            functionName: 'setKYC',
            args: [address, ninHash, photoCID]
        })
        //console.log('Success')
       return { writeToContract }
    }

    return {
        submitKYC,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error
    }
}

// export function useKYCStatus(address: string){
//     const { data: status, refetch } = useReadContract({
//         address: ,
//         abi: ,
//         functionName: 'getUserKYCData',
//         arguments: address ? [address]: undefined,
//     })

//     return {
//         status: status,

//     }
// }