import contractInfo from '../LandRegistryKYC.json'

export const KYC_CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || contractInfo.address) as `0x${string}`
export const KYC_CONTRACT_ABI = contractInfo.abi
//export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '1337')