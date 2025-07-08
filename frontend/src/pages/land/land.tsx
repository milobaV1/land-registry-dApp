import { LandCard } from "@/components/land/land-card";
import { useEffect, useState } from "react";
import type { LandResponse } from "@/service/interface/land.interface"
import { getUserLands } from "./api/get-my-lands";
import { useAccount } from "wagmi";
import { toast } from "sonner";


export function Land(){
    const [land, setLand] = useState<LandResponse[]>([])
     const { address, isConnected } = useAccount() 
     console.log(address)
     useEffect(() => {
        const fetchLands = async () => {
            if (!isConnected || !address) {
                setLand([]);
                return;
            }

            try {
                const response = await getUserLands(address);
                console.log("My Lands", response);
                
                if (response) {
                    // Handle both single object and array responses
                    const landsArray = Array.isArray(response) ? response : [response];
                    setLand(landsArray);
                } else {
                    setLand([]);
                }
            } catch (error) {
                console.error("Error fetching lands:", error);
                toast.error("Error while getting user lands");
                setLand([]);
            }
        };

        fetchLands();
    }, [address, !!isConnected]);
    return(
        <div className="h-screen p-20">
            {land.length > 0 ? (
                <div className="grid gap-4">
                    {land.map((l, index) => (
                        <LandCard key={l.id || index} {...l} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <h2 className="text-xl font-semibold mb-2">No Lands Found</h2>
                    <p className="text-gray-600">You don't own any lands yet.</p>
                </div>
            )}
        </div>
    )
}