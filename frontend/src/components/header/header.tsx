import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/button";
import Logo from "@/assets/svg/logo.svg"
import { Search, Menu } from "lucide-react"
import { DiscoverWalletProviders } from "../metamask/WalletProviders";
import { injected, useAccount, useConnect } from "wagmi";
import { useSIWE } from "@/hooks/useSIWE";
import { useAuthState } from "@/store/auth.store";
import { useEffect, useState } from "react";
import { getKYCVerificationStatus } from "@/hooks/api/check-verification";
import { Input } from "../ui/input";

export function Header(){
    const { signIn } = useSIWE()
    const { setToken, setAddress, setKycstatus, isAuthenticated, address, kycstatus } = useAuthState()
    const { connect } = useConnect()
    const { isConnected } = useAccount()
    const [searchValue, setSearchValue] = useState("")
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
        try {
            navigate({
                to: "/search-results",
                search: { q: searchValue },
            });
            setSearchValue("");
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
    //Check when the component mounts for the kycstatus
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
                            // <span className="text-green-600 font-bold">Verified</span>
                            <div></div>
                          )
                        : (
                            <Link to="/kyc"><p className="text-black font-light hover:underline hover:font-bold">KYC</p></Link>
                          )
                    }
                    <div className="relative w-[200px] lg:w-[250px]">
                    <form onSubmit={handleSearch} className="relative w-[200px] lg:w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search land..."
                        className="pl-8"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    </form>
                </div>
                    
                </div>
                
                <Button className="bg-[#379669]" onClick={handleLogin}>
                        {isAuthenticated? `Connected: ${address?.slice(0,6)}...`: "Connect Wallet"}
                    </Button>
                    {/* <DiscoverWalletProviders /> */}
            </div>
        </div>
    )
}