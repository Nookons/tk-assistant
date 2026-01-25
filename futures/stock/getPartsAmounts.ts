import {IStockAmountItem} from "@/types/stock/StockAmounts";


export const getPartsAmounts = async ({warehouse, part_number}: {warehouse: string, part_number: string}): Promise<IStockAmountItem[]> => {
    const response = await fetch(`/api/stock/get-parts-amounts?warehouse=${warehouse}&part_number=${part_number}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    return await response.json();
}