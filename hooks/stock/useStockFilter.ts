import {useMemo} from "react";
import {LocationStock, StockByLocationResponse} from "@/types/stock/SummaryItem";
import {Warehouse} from "@/lib/Warehouses";

interface Params {
    stockData: StockByLocationResponse;
    pickedWarehouse: Warehouse;
    searchValue: string;
}

export function useStockFilter({ stockData, pickedWarehouse, searchValue }: Params) {
    return useMemo<StockByLocationResponse>(() => {
        let data = [...stockData];

        if (pickedWarehouse !== 'all') {
            data = data.filter(loc =>
                loc.items?.some(item => item?.warehouse?.toUpperCase() === pickedWarehouse)
            );
        }

        const search = searchValue.trim().toUpperCase();
        if (search) {
            data = data
                .map(loc => {
                    if (loc.location?.toUpperCase().includes(search)) return loc;
                    const filtered = loc.items?.filter(item =>
                        item?.material_number?.toUpperCase().includes(search) ||
                        item?.description_eng?.toUpperCase().includes(search)
                    );
                    return filtered?.length ? { ...loc, items: filtered } : null;
                })
                .filter((l): l is LocationStock => l !== null);
        }

        return data.filter(loc =>
            loc.items?.some(i => i != null && i.total_quantity > 0)
        );
    }, [stockData, pickedWarehouse, searchValue]);
}