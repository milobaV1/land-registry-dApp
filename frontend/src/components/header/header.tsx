import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import Logo from "@/assets/svg/logo.svg"
import { Menu } from "lucide-react"
import { DiscoverWalletProviders } from "../metamask/WalletProviders";
import { injected, useAccount, useConnect } from "wagmi";
import { useSIWE } from "@/hooks/useSIWE";
import { useAuthState } from "@/store/auth.store";

export function Header(){
    const { signIn } = useSIWE()
    const { setToken, setAddress, setKycstatus, isAuthenticated, address, kycstatus } = useAuthState()
    const { connect } = useConnect()
    const { isConnected } = useAccount()

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

    //Check when the component mounts for the kycstatus
    return(
        <div className="w-full bg-white fixed top-0 p-3 border border-b-3">
            <div className="flex justify-between items-center h-full">
                
                <div className="flex items-center gap-4">
                    <img src={Logo} alt="logo" />
                    <h1 className="text-[#379669] font-bold text-[10px]">LandRegistry</h1>
                </div>
                
                <div className="flex items-center gap-20 text-[25px]">
                    <Link to="/"><p className="text-black font-light hover:underline hover:font-bold">Home</p></Link>
                    <Link to="/register"><p className="text-black font-light hover:underline hover:font-bold">Register Land</p></Link>
                    <Link to="/"><p className="text-black font-light hover:underline hover:font-bold">My Land(s)</p></Link>
                    {kycstatus == "verified"
                        ? (
                            // put something to show that the user is verified
                            <span className="text-green-600 font-bold">Verified</span>
                          )
                        : (
                            <Link to="/kyc"><p className="text-black font-light hover:underline hover:font-bold">KYC</p></Link>
                          )
                    }
                    
                </div>
                <Button className="bg-[#379669]" onClick={handleLogin}>
                        {isAuthenticated? `Connected: ${address?.slice(0,6)}...`: "Connect Wallet"}
                    </Button>
                    {/* <DiscoverWalletProviders /> */}
            </div>
        </div>
    )
}