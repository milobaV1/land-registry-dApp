import type { LandResponse } from "@/service/interface/land.interface";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { searchLand } from "./api/search-results";
import { LandCard } from "@/components/land/land-card";
import type { Search } from "@/service/interface/search.interface";

export function SearchResults(){
    const { currentOwner, landId } = useSearch({ from: '/_layout/search-results' })
    const [results, setResults] = useState<LandResponse[]>([]);

    useEffect(() => {
        const fetch = async () => {
            const data: Search = {
                currentOwner,
                id: landId
            }
            const response = await searchLand(data);
            console.log("Search result: ", response)
            setResults(response)
        }
        fetch();
    }, [currentOwner, landId])

    return(
            <div className="h-full p-20">
                {results.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {results.map((l, index) => (
                            <LandCard key={l.id || index} {...l} />
                        ))}
                    </div>
                ) : (
                    <div className="h-screen text-center py-8">
                        <h2 className="text-xl font-semibold mb-2">No Lands Found</h2>
                    </div>
                )}
            </div>
        )
}