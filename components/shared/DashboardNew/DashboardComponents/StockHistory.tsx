import React, { useMemo } from 'react';
import { useStockStore } from "@/store/stock";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IHistoryStockItem } from "@/types/stock/HistoryStock";
import {useUserStore} from "@/store/user";
import {getUserWarehouse} from "@/utils/getUserWarehouse";
import {PackageOpen} from "lucide-react";
import dayjs from "dayjs";
import UserAvatar from "@/components/shared/User/UserAvatar";
import Link from "next/link";

const PREVIEW_LIMIT = 8;

const StockHistory = () => {
    const user = useUserStore(state => state.currentUser)
    const warehouse = getUserWarehouse(user?.warehouse || '')
    const stock_history = useStockStore(state => state.stock_history);

    const recentItems = useMemo<IHistoryStockItem[]>(() => {
        if (!stock_history) return [];
        const filtered = stock_history.sort((a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf());
        return [...filtered].reverse().slice(0, PREVIEW_LIMIT);
    }, [stock_history]);

    if (!stock_history) return null;

    return (
        <Table>
            <TableHeader>
                <TableRow>
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
                        >
                            <TableCell>
                                <div className={`flex gap-2 items-center`}>
                                    <div className={`w-8 h-8 rounded-xl overflow-hidden`}>
                                        <UserAvatar user={item.user} allowFullscreen />
                                    </div>
                                    <div>
                                        <Link
                                            className={`text-muted-foreground hover:text-blue-500 hover:underline`}
                                            href={`/user/${item.user.auth_id}`}
                                        >
                                            {item.user.user_name}
                                        </Link>
                                    </div>
                                </div>
                            </TableCell>
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