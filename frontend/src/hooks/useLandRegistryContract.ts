import { useWaitForTransactionReceipt } from "wagmi"
import { useLandRegistryWrite } from "./useLandRegistryWrite"

export function useLandRegistry() {
  const { read, write, data: hash, isPending, error } = useLandRegistryWrite()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const registerLand = async (
    state: string,
    lga: string,
    area: number,
    landUse: string,
    ipfs: string
  ) => {
    return write({
      functionName: "registerLand",
      args: [state, lga, BigInt(area), landUse, ipfs],
    })
  }

  const verifyLand = async (landId: number) => {
    return write({
      functionName: "verifyLand",
      args: [landId],
    })
  }

  const transferLand = async (landId: number, newOwnerAddress: string) => {
    return write({
        functionName: 'transferLand',
        args: [landId, newOwnerAddress]
    })
  }

  const getAllLand = async() => {
    return read({
        functionName: 'getAllLand'
    })
  }

  const getLand = async (landId: number) => {
    return read({
        functionName: 'getLand',
        args: [landId]
    })
  }

  const doesOwnerHaveLand = async (owner: string, landId: number) => {
    return read({
        functionName: 'doesOwnerHaveLand',
        args: [owner, landId]
    })
  }

  const getLandCount = async (owner: string) => {
    return read({
        functionName: 'getLandCount',
        args: [owner]
    })
  }

  const isVerified = async (landId: number) => {
    return read({
        functionName: 'isVerified',
        args: [landId]
    })
  }

  const getOwnershipHistory = async (landId: number) => {
    return read({
        functionName: 'getOwnershipHistory',
        args: [landId]
    })
  }

  const getLandsByState = async (state: string) => {
    return read({
        functionName: 'getLandsByState',
        args: [state]
    })
  }

  const getVerifiedLands = async () => {
    return read({
        functionName: 'getVerifiedLands'
    })
  }

  const getTotalLandCount = async () => {
    return read({
        functionName: 'getTotalLandCount'
    })
  }

   const getLandsByUse = async (landUse: string) => {
    return read({
        functionName: 'getLandsByUse',
        args: [landUse]
    })
  }



  return {
    registerLand,
    verifyLand,
    transferLand,
    getAllLand,
    getLand,
    doesOwnerHaveLand,
    getLandCount,
    isVerified,
    getOwnershipHistory,
    getLandsByState,
    getVerifiedLands,
    getTotalLandCount,
    getLandsByUse,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
