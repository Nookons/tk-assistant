import {useState} from "react";
import {LocationItem, LocationStock} from "@/types/stock/SummaryItem";
import {useStockData} from "@/hooks/stock/useStockData";
import {useWarehouseFilter} from "@/hooks/stock/useWarehouseFilter";
import {useStockSearch} from "@/hooks/stock/useStockSearch";
import {useStockFilter} from "@/hooks/stock/useStockFilter";
import {useStockPagination} from "@/hooks/stock/useStockPagination";
import {useStockExport} from "@/hooks/stock/useStockExport";

export function useStockPage() {
    const [pickedItem, setPickedItem] = useState<LocationStock | null>(null);

    const { stockData, isLoading, isError, error, updateLocation } = useStockData();
    const { pickedWarehouse, handleWarehouse, WAREHOUSES, WAREHOUSE_LABELS } = useWarehouseFilter();
    const { searchValue, handleSearch, clearSearch } = useStockSearch();

    const filteredData = useStockFilter({ stockData, pickedWarehouse, searchValue });
    const pagination = useStockPagination(filteredData);
    const { isExporting, handleExport } = useStockExport(filteredData, pickedWarehouse);

    const handleLocationUpdate = (key: string, items: LocationItem[]) => {
        updateLocation(key, items);
        setPickedItem(prev => prev?.location === key ? { ...prev, items } : prev);
    };

    return {
        stockData,
        isLoading, isError, error,
        pickedItem, setPickedItem,
        pickedWarehouse, handleWarehouse, WAREHOUSES, WAREHOUSE_LABELS,
        searchValue, handleSearch, clearSearch,
        filteredData,
        ...pagination,
        isExporting, handleExport,
        handleLocationUpdate,
    };
}