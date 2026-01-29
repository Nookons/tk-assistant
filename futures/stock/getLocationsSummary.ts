import {StockByLocationResponse} from "@/types/stock/SummaryItem";

export const getLocationsSummary = async (): Promise<StockByLocationResponse> => {
    const res = await fetch(`/api/stock/get-locations-data`);

    if (!res.ok) {
        throw new Error(`Could not get all shifts (status: ${res.status})`);
    }

    return await res.json();
}