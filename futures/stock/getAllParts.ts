import {IStockItemTemplate} from "@/types/stock/StockItem";

export const getAllParts = async (): Promise<IStockItemTemplate[]> => {
    const res = await fetch(`/api/stock/get-all-parts`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error(`Could not get all shifts (status: ${res.status})`);
    }

    return await res.json();
}