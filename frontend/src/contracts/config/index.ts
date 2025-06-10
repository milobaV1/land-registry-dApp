import contractInfo from '../LandRegistryKYC.json';
import { default as Registry } from '../LandRegistry.json';

export const KYC_CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || contractInfo.address) as `0x${string}`
export const KYC_CONTRACT_ABI = contractInfo.abi

export const LAND_REGISTRY_CONTRACT_ADDRESS = (import.meta.env.VITE_LAND_REGISTRY_CONTRACT_ADDRESS || Registry.address) as `0x${string}`
export const LAND_REGISTRY_CONTRACT_ABI = Registry.abi
//export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '1337')