import {useEffect, useState} from "react";
import {LocationItem, StockByLocationResponse} from "@/types/stock/SummaryItem";
import {useQuery} from "@tanstack/react-query";
import {getLocationsSummary} from "@/futures/stock/getLocationsSummary";

export function useStockData() {
    const [stockData, setStockData] = useState<StockByLocationResponse>([]);

    const { data: locationsSummary, isLoading, isError, error } = useQuery({
        queryKey: ['stockHistory-locations-full'],
        queryFn: getLocationsSummary,
        retry: 3,
    });

    useEffect(() => {
        if (locationsSummary) setStockData(locationsSummary);
    }, [locationsSummary]);

    const updateLocation = (locationKey: string, newItems: LocationItem[]) => {
        setStockData(prev => {
            const exists = prev.some(loc => loc.location === locationKey);

            if (exists) {
                return prev.map(loc =>
                    loc.location === locationKey
                        ? { ...loc, items: newItems }
                        : loc
                );
            }

            return [...prev, { location: locationKey, items: newItems }];
        });
    };

    return { stockData, isLoading, isError, error, updateLocation };
}