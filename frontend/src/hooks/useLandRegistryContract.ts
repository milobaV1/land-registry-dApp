import { useWaitForTransactionReceipt } from "wagmi"
import { useLandRegistryWrite } from "./useLandRegistryWrite"
import type { RegisterLandOnChain } from "@/service/interface/land.interface"
import { decodeEventLog } from "viem"
import { LAND_REGISTRY_CONTRACT_ABI } from "@/contracts/config"
import { getLanduseNumber } from "@/lib/converter"
import { useMemo } from "react"

export function useLandRegistry() {
  const { read, write, data: hash, isPending, error } = useLandRegistryWrite()
  const { isLoading: isConfirming, isSuccess, data: receipt, error: waitError } = useWaitForTransactionReceipt({ hash })

  const decodedEvents = useMemo(() => {
    if(!receipt || !receipt.logs) return []
    return receipt.logs
    .map(log => {
      try{
        return decodeEventLog({
          abi: LAND_REGISTRY_CONTRACT_ABI,
          data: log.data,
          topics: log.topics
        })
      }catch{
        return null
      }
    }).filter(Boolean)
  }, [receipt])

  // Memoize the land ID extraction
  const onChainLandId = useMemo(() => {
    if (!decodedEvents.length) return null
    
    console.log('All decoded events:', decodedEvents) // Debug log
    
    const landRegisteredEvent = decodedEvents.find(event => event?.eventName === 'LandCreated')
    console.log('LandCreated event:', landRegisteredEvent) // Debug log
    
    if (landRegisteredEvent && landRegisteredEvent.args) {
      console.log('Event args:', landRegisteredEvent.args) // Debug log
      
      const argsObj = landRegisteredEvent.args as any
      const landId = argsObj.landId
      
      // Convert BigInt to string for display
      if (landId !== undefined && landId !== null) {
        return landId.toString()
      }
    }
    
    return null
  }, [decodedEvents])


  const registerLand = async (
    data: RegisterLandOnChain
  ) => {
    const landuseNumber = getLanduseNumber(data.landuse)
    console.log(`Area: ${data.area}, Land use: ${data.landuse}`)
    return write({
      functionName: "registerLand",
      args: [data.state, data.lga, BigInt(data.area), landuseNumber, data.ipfs],
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
    onChainLandId,
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
    events: decodedEvents,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    waitError,
    receipt
  }
}
