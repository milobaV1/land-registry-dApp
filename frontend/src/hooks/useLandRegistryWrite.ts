import { LAND_REGISTRY_CONTRACT_ABI, LAND_REGISTRY_CONTRACT_ADDRESS } from "@/contracts/config"
import { useWriteContract, useReadContract } from "wagmi"

export function useLandRegistryWrite() {
  const { writeContract, ...rest } = useWriteContract()

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

  const read = ({
    functionName,
    args,
  }: {
    functionName: string
    args?: any[]
  }) => {
    return useReadContract({
        abi: LAND_REGISTRY_CONTRACT_ABI,
        address: LAND_REGISTRY_CONTRACT_ADDRESS,
        functionName,
        args,
    })
  }

  return {
    read,
    write,
    ...rest,
  }
}
