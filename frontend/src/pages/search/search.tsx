import type { LandResponse } from "@/service/interface/land.interface";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { searchLand } from "./api/search-results";
import { LandCard } from "@/components/land/land-card";

export function SearchResults(){
    const { q } = useSearch({ from: '/_layout/search-results' })
    const [results, setResults] = useState<LandResponse[]>([]);

    useEffect(() => {
        const fetch = async () => {
            const data = await searchLand({ search: q });
            console.log("Search result: ", data)
            setResults(data)
        }
        fetch();
    }, [q])

    return(
            <div className="h-screen p-20">
                {results.length > 0 ? (
                    <div className="grid gap-4">
                        {results.map((l, index) => (
                            <LandCard key={l.id || index} {...l} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <h2 className="text-xl font-semibold mb-2">No Lands Found</h2>
                    </div>
                )}
            </div>
        )
}