import Logo from "@/assets/svg/logo.svg"
import { Link } from "@tanstack/react-router"

export function Footer(){
    return(
        <div className="h-[20rem] bg-[#111827] w-full p-10">
            <div className="grid grid-cols-4 gap-10 mb-10">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <img src={Logo} alt="Logo" />
                    <p className="text-[#379669] font-bold text-[20px]">LandRegistry</p>
                </div>
                <span className="flex flex-col text-[#9CA3AF]">
                    <p>Secure, transparent, and immutable land ownership</p>
                    <p>records powered by blockchain technology.</p>
                </span>
            </div>
            <div className="flex flex-col">
                <p className="text-white text-[25px]">Quick Links</p>
                    <div className="flex flex-col gap-2 text-[15px]">
                        <Link to="/"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">Home</p></Link>
                        <Link to="/register"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">Register Land</p></Link>
                        <Link to="/land"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">My Land(s)</p></Link>
                        <Link to="/kyc"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">KYC</p></Link>
                    </div>
            </div>
            <div>
                <p className="text-white text-[25px]">Resources</p>
                    <div className="flex flex-col gap-2 text-[15px]">
                        <Link to="/"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">About</p></Link>
                        <Link to="/"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">Documentation</p></Link>
                        <Link to="/"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">API</p></Link>
                        <Link to="/"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">Support</p></Link>
                    </div>
            </div>
            <div>
                <p className="text-white text-[25px]">Contact</p>
                    <div className="flex flex-col gap-2 text-[15px]">
                        <Link to="/"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">Contact Us</p></Link>
                        <Link to="/"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">Help Center</p></Link>
                        <Link to="/"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">Privacy Policy</p></Link>
                        <Link to="/"><p className="text-[#9CA3AF] font-light hover:underline hover:font-bold">Terms of Service</p></Link>
                    </div>
            </div>
            </div>
            <hr />
            <span className="flex justify-center m-5 text-[#9CA3AF]">
                © 2024 LandRegistry. All rights reserved.
            </span>
        </div>
    )
}