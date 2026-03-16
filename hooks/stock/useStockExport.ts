import {StockByLocationResponse} from "@/types/stock/SummaryItem";
import {useState} from "react";
import {stockToExcel} from "@/futures/excel/StockToExcel";
import { Warehouse } from "@/lib/Warehouses";

export function useStockExport(filteredData: StockByLocationResponse, pickedWarehouse: Warehouse) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await stockToExcel(filteredData, pickedWarehouse);
        } finally {
            setIsExporting(false);
        }
    };

    return { isExporting, handleExport };
}