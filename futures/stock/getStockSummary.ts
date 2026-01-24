import {ISummaryItemStock} from "@/types/stock/SummaryItem";

export const getStockSummary = async (): Promise<ISummaryItemStock[]> => {

    const response = await fetch(`/api/stock/get-stock-summary`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    return await response.json();
}