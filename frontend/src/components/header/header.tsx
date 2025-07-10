import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/button";
import Logo from "@/assets/svg/logo.svg"
import { Search, Hash, X, Wallet } from "lucide-react"
import { DiscoverWalletProviders } from "../metamask/WalletProviders";
import { injected, useAccount, useConnect } from "wagmi";
import { useSIWE } from "@/hooks/useSIWE";
import { useAuthState } from "@/store/auth.store";
import { useEffect, useState } from "react";
import { getKYCVerificationStatus } from "@/hooks/api/check-verification";
import { Input } from "../ui/input";
import { toast } from "sonner";

export function Header(){
    const { signIn } = useSIWE()
    const { setToken, setAddress, setKycstatus, isAuthenticated, address, kycstatus } = useAuthState()
    const { connect } = useConnect()
    const { isConnected } = useAccount()
    const [currentOwner, setCurrentOwner] = useState("")
    const [landIdOnChain, setLandIdOnChain] = useState("")
    const [isSearchExpanded, setIsSearchExpanded] = useState(false)
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!isConnected) await connect({ connector: injected()});
        try {
            const { token, address, kycStatus } = await signIn();
            if(token && address){
                setToken(token);
                setAddress(address);
                setKycstatus(kycStatus)
            }
        } catch (error) {
            console.error('Login Failed', error)
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentOwner || !landIdOnChain) {
            toast("Both Address and Land ID are required.");
            return;
        }
        try {
            navigate({
                to: "/search-results",
                search: { currentOwner, landIdOnChain: Number(landIdOnChain) },
            });
            setCurrentOwner("");
            setLandIdOnChain("")
            setIsSearchExpanded(false)
        } catch (err) {
            console.error("Search failed:", err);
        }
    };

    useEffect(() => {
        const checkKycStatus = async () => {
            if (isAuthenticated && address) {
                try {
                   const kycStatus = await getKYCVerificationStatus(address)
                    if(kycStatus) setKycstatus(kycStatus)
                } catch (error) {
                    console.error('Failed to check KYC status:', error);
                }
            }
        };

        checkKycStatus();
    }, [isAuthenticated, address, setKycstatus]);

    return(
        <div className="w-full bg-white fixed top-0 p-3 border border-b-3">
            <div className="flex justify-between items-center h-full gap-2">
                
                <div className="flex items-center gap-4">
                    <img src={Logo} alt="logo" />
                    <h1 className="text-[#379669] font-bold text-[10px]">LandRegistry</h1>
                </div>
                
                <div className="flex items-center gap-15 text-[22px]">
                    <Link to="/"><p className="text-black font-light hover:underline hover:font-bold">Home</p></Link>
                    <Link to="/register"><p className="text-black font-light hover:underline hover:font-bold">Register Land</p></Link>
                    <Link to="/land"><p className="text-black font-light hover:underline hover:font-bold">My Land(s)</p></Link>
                    {kycstatus == "verified"
                        ? (
                            <div></div>
                          )
                        : (
                            <Link to="/kyc"><p className="text-black font-light hover:underline hover:font-bold">KYC</p></Link>
                          )
                    }
                    
                    {/* Expandable Search */}
                    <div className="relative">
                        {!isSearchExpanded ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsSearchExpanded(true)}
                                className="flex items-center gap-2"
                            >
                                <Search className="h-4 w-4" />
                                Search Land
                            </Button>
                        ) : (
                            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border">
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Wallet Address"
                                        className="pl-10 w-40 border-0 bg-transparent focus:ring-0 text-sm"
                                        value={currentOwner}
                                        onChange={(e) => setCurrentOwner(e.target.value)}
                                    />
                                </div>
                                
                                <div className="h-6 w-px bg-gray-300"></div>
                                
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Land ID"
                                        className="pl-10 w-28 border-0 bg-transparent focus:ring-0 text-sm"
                                        value={landIdOnChain}
                                        onChange={(e) => setLandIdOnChain(e.target.value)}
                                    />
                                </div>
                                
                                <Button type="submit" size="sm" className="bg-[#379669] text-white">
                                    <Search className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsSearchExpanded(false);
                                        setCurrentOwner("");
                                        setLandIdOnChain("");
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
                
                <Button className="bg-[#379669]" onClick={handleLogin}>
                    {isAuthenticated? `Connected: ${address?.slice(0,6)}...`: "Connect Wallet"}
                </Button>
            </div>
        </div>
    )
}