import {IStockItemTemplate} from "@/types/stock/StockItem";

export const getPartByNumber = async (part_number: string): Promise<IStockItemTemplate[]> => {
    const res = await fetch(`/api/stock/get-part-by-number?part_number=${part_number}`, {
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