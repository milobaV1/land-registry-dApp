import { useState } from "react"
import { useLandRegistry } from "@/hooks/useLandRegistryContract"
import type { BlockchainLandData, LandResponse, VerificationResult } from "@/service/interface/land.interface"
import { Button } from "../ui/button"

export function LandCard(land: LandResponse) {
    const { getLand } = useLandRegistry()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [blockchainData, setBlockchainData] = useState<BlockchainLandData | null>(null)
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Function to verify data integrity
    const verifyDataIntegrity = (backendData: LandResponse, chainData: BlockchainLandData): VerificationResult => {
        const mismatches: string[] = []
        
        // Convert backend registration date to timestamp for comparison
        const backendRegDate = backendData.registrationDate instanceof Date 
            ? Math.floor(backendData.registrationDate.getTime() / 1000)
            : new Date(backendData.registrationDate).getTime() / 1000

        // Check each field
        if (backendData.landIdOnChain !== Number(chainData.landId)) {
            mismatches.push("Land ID mismatch")
        }
        if (backendData.state.toLowerCase() !== chainData.state.toLowerCase()) {
            mismatches.push("State mismatch")
        }
        if (backendData.lga.toLowerCase() !== chainData.lga.toLowerCase()) {
            mismatches.push("LGA mismatch")
        }
        if (Number(backendData.area) !== Number(chainData.area)) {
            mismatches.push("Area mismatch")
        }
        if (Math.abs(backendRegDate - Number(chainData.registrationDate)) > 60) { // 1 minute tolerance
            mismatches.push("Registration date mismatch")
        }

        return {
            isAccurate: mismatches.length === 0,
            mismatches
        }
    }

    const handleVerifyClick = async () => {
        setIsLoading(true)
        setError(null)
        
        try {
            const response = await getLand(land.landIdOnChain)
            console.log("Land info: ", response)
            
            setBlockchainData(response as BlockchainLandData)
            
            // Perform verification
            const verification = verifyDataIntegrity(land, response as BlockchainLandData)
            setVerificationResult(verification)
            
            setIsModalOpen(true)
        } catch (error) {
            console.error("Verification failed:", error)
            setError("Failed to verify land data. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setBlockchainData(null)
        setVerificationResult(null)
        setError(null)
    }

    const formatTimestamp = (timestamp: bigint) => {
        return new Date(Number(timestamp) * 1000).toLocaleString()
    }

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const getLandUseText = (landUse: number) => {
        const landUseTypes = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use']
        return landUseTypes[landUse] || 'Unknown'
    }

    const getTransferStatusText = (status: number) => {
        const statusTypes = ['Active', 'Pending Transfer', 'Transferred', 'Locked']
        return statusTypes[status] || 'Unknown'
    }

    return (
        <>
            <div className="w-full max-w-4xl mx-auto border-2 border-gray-200 rounded-2xl shadow-xl bg-gradient-to-br from-white via-gray-50 to-blue-50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] p-8">
    {/* Header with Land ID */}
    <div className="mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Land Registry Certificate</h3>
                <p className="text-gray-600">Official blockchain-verified land registration</p>
            </div>
        </div>
    </div>
    
    {/* Content Grid - Now in 3 columns for better use of space */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Left Column */}
        <div className="space-y-6">
            <div className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-[6rem]">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">Land Id On Chain</p>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                    {land.landIdOnChain}
                </p>
            </div>
            <div className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-[6rem]">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">Land Area</p>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                    {land.area}
                </p>
            </div>
        </div>
        
        {/* Middle Column */}
        <div className="space-y-6">
            <div className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-[6rem]">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">Land Use</p>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {land.landUse}
                </p>
            </div>
            <div className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-[6rem]">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">Local Government Area</p>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {land.lga}
                </p>
            </div>
        </div>
        
        {/* Right Column - Registration Info */}
        <div className="space-y-6">
            <div className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-[6rem]">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">State</p>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                    {land.state}
                </p>
            </div>
            <div className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-[6rem]">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">Registration Date</p>
                <p className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                    {land.registrationDate instanceof Date ? land.registrationDate.toLocaleDateString() : land.registrationDate}
                </p>
            </div>
        </div>
    </div>
    
    {/* Footer with Verify Button */}
    <hr />
    <div className="pt-6 border-gray-200 w-[10rem]">
        <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Verify Button */}
            <Button
                className={`flex-1 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group text-lg ${
                    isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl'
                }`}
                onClick={handleVerifyClick}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Verifying on blockchain...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verify Land Ownership on Blockchain
                    </>
                )}
            </Button>
        </div>
    </div>

    {/* Error Message */}
    {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
        </div>
    )}
</div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#379669] bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">Blockchain Verification</h2>
                                <button 
                                    onClick={closeModal}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Verification Status */}
                            {verificationResult && (
                                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                                    verificationResult.isAccurate 
                                        ? 'bg-green-50 border border-green-200' 
                                        : 'bg-red-50 border border-red-200'
                                }`}>
                                    <div className={`p-2 rounded-full ${
                                        verificationResult.isAccurate ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                        {verificationResult.isAccurate ? (
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${
                                            verificationResult.isAccurate ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {verificationResult.isAccurate ? 'Data Verified - Accurate' : 'Data Verification Failed'}
                                        </h3>
                                        <p className={`text-sm ${
                                            verificationResult.isAccurate ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {verificationResult.isAccurate 
                                                ? 'All data matches blockchain records' 
                                                : `Issues found: ${verificationResult.mismatches.join(', ')}`
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {blockchainData && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Basic Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Basic Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Land ID</p>
                                                <p className="text-lg font-medium text-gray-800">{blockchainData.landId.toString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">State</p>
                                                <p className="text-lg font-medium text-gray-800">{blockchainData.state}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">LGA</p>
                                                <p className="text-lg font-medium text-gray-800">{blockchainData.lga}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Area</p>
                                                <p className="text-lg font-medium text-gray-800">{blockchainData.area.toString()} sq meters</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Land Use</p>
                                                <p className="text-lg font-medium text-gray-800">{getLandUseText(blockchainData.landUse)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ownership Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Ownership Details
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Current Owner</p>
                                                <p className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                                                    {formatAddress(blockchainData.currentOwner)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Transfer Status</p>
                                                <p className="text-lg font-medium text-gray-800">{getTransferStatusText(blockchainData.transferStatus)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Verification Status</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    blockchainData.isVerified 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {blockchainData.isVerified ? 'Verified' : 'Pending Verification'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Timeline
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Registration Date</p>
                                                <p className="text-sm font-medium text-gray-800">{formatTimestamp(blockchainData.registrationDate)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Last Transfer</p>
                                                <p className="text-sm font-medium text-gray-800">{formatTimestamp(blockchainData.lastTransferDate)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Additional Data
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">IPFS Hash</p>
                                                <p className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border break-all">
                                                    {blockchainData.landIpfs}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Ownership History</p>
                                                <div className="space-y-1">
                                                    {blockchainData.ownershipHistory.map((owner, index) => (
                                                        <p key={index} className="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded border">
                                                            {formatAddress(owner)}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}