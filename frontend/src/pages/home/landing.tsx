import { Button } from "@/components/ui/button";
import Fast from "@/assets/svg/fast.svg";
import Secure  from "@/assets/svg/secure.svg";
import Transparent from "@/assets/svg/transparent.svg";
import One from "@/assets/svg/1.svg";
import Two from "@/assets/svg/2.svg";
import Three from "@/assets/svg/3.svg"

export default function LandingPage(){
    return(
        <div className="h-full w-full flex flex-col pt-3">
            <div className="h-[50rem] w-full bg-[#338e64] flex flex-col items-center justify-center gap-10 p-10">
                <h1 className="text-white">Decentralized Land Registry</h1>
                <div className="flex flex-col items-center text-white">
                    <h3>Secure, transparent, and immutable land ownership records powered by blockchain</h3>
                    <h3>technology. Register, verify, and transfer land ownership with complete trust and transparency.</h3>
                </div>
                <div className="flex gap-10">
                    <Button size={"lg"}>Register Land</Button>
                    <Button size={"lg"}>Verify Land</Button>
                    
                </div>
                 <div className="flex flex-col items-center text-white">
                    <h2 className="text-[30px]">Why Choose Our Platform?</h2>
                    <h3>Experience the future of land registration with our secure, transparent,</h3>
                    <h3>and efficient blockchain-based system.</h3>
                </div>
                 <div className="grid grid-cols-3 gap-6 text-white">
                    <div className="flex flex-col items-center gap-4">
                        <img src={Secure} alt="secure" className="w-20 h-20" />
                        <h2 className="font-bold">Secure & Immutable</h2>
                        <span className="flex flex-col items-center">
                            <h3>All land records are stored on blockchain,</h3>
                            <h3>ensuring they cannot be tampered with or falsified</h3>
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <img src={Transparent} alt="tranparent" className="w-20 h-20" />
                        
                        <h2 className="font-bold">Tranparent Process</h2>
                        <span className="flex flex-col items-center">
                            <h3>All transactions and verifications are publicly </h3>
                            <h3>auditable while maintaining privacy.</h3>
                        </span>
        
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <img src={Fast} alt="fast" className="w-20 h-20"/>
                        <h2 className="font-bold">Fast & Efficient</h2>
                        <span className="flex flex-col items-center">
                            <h3>Streamlined processes reduce registration time</h3>
                            <h3>from months to minutes with automated verification.</h3>
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-white h-[50rem] w-full flex flex-col items-center justify-center gap-10 m-10 p-10">
                <div className="flex flex-col items-center">
                    <h1>How It Works</h1>
                    <h2>Simple Steps to register and verify your land ownership on the blockchain</h2>
                </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex flex-col items-center gap-4">
                        <img src={One} alt="One" className="w-20 h-20" />
                        <h2 className="text-[30px] font-bold">Complete KYC</h2>

                            <h3>Submit your identity verification documents to ensure secure and legitimate land registration</h3>
                
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <img src={Two} alt="Two" className="w-20 h-20" />
                        
                        <h2 className="text-[30px] font-bold">Register Land</h2>
                    
                            <h3>Provide land details, documentation, and submit for blockchain registration and verification</h3>
            
        
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <img src={Three} alt="Three" className="w-20 h-20"/>
                        <h2 className="text-[30px] font-bold">Get Verified</h2>
                        <h3>Once verified by authorities, your land ownership is permanently recorded on the blockchain</h3>
                    </div>
                </div>
               </div>
        </div>
    )
}