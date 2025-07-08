import { LAND_REGISTRY_CONTRACT_ABI, LAND_REGISTRY_CONTRACT_ADDRESS } from "@/contracts/config"
import { useWriteContract, usePublicClient } from "wagmi"
import { getContract } from "viem"
import { useMemo } from "react"

export function useLandRegistryWrite() {
  const { writeContract, ...rest } = useWriteContract()
  const publicClient = usePublicClient()

  const write = ({
    functionName,
    args,
  }: {
    functionName: string
    args: any[]
  }) => {
    return writeContract({
      address: LAND_REGISTRY_CONTRACT_ADDRESS,
      abi: LAND_REGISTRY_CONTRACT_ABI,
      functionName,
      args,
    })
  }
// THIS READ BREAKS THE REACT HOOK RULES
 // const read = ({
//     functionName,
//     args,
//   }: {
//     functionName: string
//     args?: any[]
//   }) => {
//     return useReadContract({
//         abi: LAND_REGISTRY_CONTRACT_ABI,
//         address: LAND_REGISTRY_CONTRACT_ADDRESS,
//         functionName,
//         args,
//     })
//   }
  // Create contract instance for reads
  const contract = useMemo(() => {
    if (!publicClient) return null
    
    return getContract({
      address: LAND_REGISTRY_CONTRACT_ADDRESS,
      abi: LAND_REGISTRY_CONTRACT_ABI,
      client: publicClient,
    })
  }, [publicClient])

  // Replace the read function with one that doesn't call hooks
  const read = async ({
    functionName,
    args,
  }: {
    functionName: string
    args?: any[]
  }) => {
    if (!contract) {
      throw new Error('Contract not initialized')
    }
    
    // Use direct contract read instead of useReadContract
    return contract.read[functionName as keyof typeof contract.read](args || [])
  }

  return {
    read,
    write,
    ...rest,
  }
}