import React, { useMemo } from 'react';
import { useStockStore } from "@/store/stock";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IHistoryStockItem } from "@/types/stock/HistoryStock";

const PREVIEW_LIMIT = 8;

const StockHistory = () => {
    const stock_history = useStockStore(state => state.stock_history);

    const recentItems = useMemo<IHistoryStockItem[]>(() => {
        if (!stock_history) return [];
        return [...stock_history].reverse().slice(0, PREVIEW_LIMIT);
    }, [stock_history]);

    if (!stock_history) return null;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recentItems.map((item) => (
                    <TableRow
                        key={item.id}
                        className={item.value < 0 ? "bg-destructive/5 hover:bg-destructive/10" : ""}
                    >
                        <TableCell>{item.warehouse}</TableCell>
                        <TableCell>{item.user.user_name}</TableCell>
                        <TableCell>{item.material_number}</TableCell>
                        <TableCell
                            className={`font-medium ${item.value < 0 ? "text-destructive" : "text-emerald-500"}`}
                        >
                            {/* Явно показываем + у положительных */}
                            {item.value > 0 ? `+${item.value}` : item.value}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default React.memo(StockHistory);