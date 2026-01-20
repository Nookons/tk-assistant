import {IHistoryStockItem} from "@/types/stock/HistoryStock";

export const getAllStockHistory = async (): Promise<IHistoryStockItem[]> => {
    const res = await fetch(`/api/stock/get-stock-history`);

    if (!res.ok) {
        throw new Error(`Could not get all shifts (status: ${res.status})`);
    }

    return await res.json();
}