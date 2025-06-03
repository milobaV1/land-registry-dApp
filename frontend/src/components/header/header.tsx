import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import Logo from "@/assets/svg/logo.svg"
import { Menu } from "lucide-react"

export function Header(){
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
                    <Link to="/kyc"><p className="text-black font-light hover:underline hover:font-bold">KYC</p></Link>
                </div>
                <Button className="bg-[#379669]">
                        Connect Wallet
                    </Button>
            </div>
        </div>
    )
}