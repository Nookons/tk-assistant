import React, { useMemo } from 'react';
import { useStockStore } from "@/store/stock";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IHistoryStockItem } from "@/types/stock/HistoryStock";
import {useUserStore} from "@/store/user";
import {getUserWarehouse} from "@/utils/getUserWarehouse";
import {PackageOpen} from "lucide-react";

const PREVIEW_LIMIT = 8;

const StockHistory = () => {
    const user = useUserStore(state => state.currentUser)
    const warehouse = getUserWarehouse(user?.warehouse || '')
    const stock_history = useStockStore(state => state.stock_history);

    const recentItems = useMemo<IHistoryStockItem[]>(() => {
        if (!stock_history) return [];
        const filtered = stock_history.filter(robot => warehouse.toLowerCase() === 'leader' || robot.warehouse === warehouse)
        return [...filtered].reverse().slice(0, PREVIEW_LIMIT);
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
                {recentItems.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                                <PackageOpen size={28} className="opacity-30" />
                                <span>No stock history for {warehouse}</span>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    recentItems.map((item) => (
                        <TableRow
                            key={item.id}
                            className={item.quantity < 0 ? "bg-destructive/5 hover:bg-destructive/10" : ""}
                        >
                            <TableCell>{item.warehouse}</TableCell>
                            <TableCell>{item.user.user_name}</TableCell>
                            <TableCell>{item.material_number}</TableCell>
                            <TableCell className={`font-medium ${item.quantity < 0 ? "text-destructive" : "text-emerald-500"}`}>
                                {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
};

export default React.memo(StockHistory);