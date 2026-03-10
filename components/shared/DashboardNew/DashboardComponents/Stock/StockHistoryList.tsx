import React, { useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    ArrowDownFromLine, ArrowUpFromLine, Bot,
    MapPinHouse,
    Minus, Package, SquareArrowOutUpRight,
    Trash2, User, Warehouse, Wrench,
} from 'lucide-react';

import { useUserStore } from '@/store/user';
import { useStockStore } from '@/store/stock';
import { getUserWarehouse } from '@/utils/getUserWarehouse';
import { timeToString } from '@/utils/timeToString';
import { StockService } from '@/services/stockService';
import { IHistoryStockItem } from '@/types/stock/HistoryStock';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const SHOW_LIMIT_DEFAULT = 15;
const SHOW_LIMIT_EXPANDED = 50;

// ─── Sub-components ──────────────────────────────────────────────────────────

function QuantityCell({ quantity }: { quantity: number }) {
    const isNegative = quantity < 0;
    return (
        <TableCell className={`text-sm font-semibold tabular-nums ${isNegative ? 'text-destructive' : 'text-emerald-500'}`}>
            {quantity > 0 ? `+${quantity.toLocaleString()}` : quantity.toLocaleString()}
        </TableCell>
    );
}

function LinkCell({ href, label }: { href: string; label: string }) {
    return (
        <Link href={href} className="hover:underline text-blue-500 font-medium">
            {label}
        </Link>
    );
}

function EmptyRow({ warehouse }: { warehouse: string }) {
    return (
        <TableRow>
            <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                <Package size={24} className="mx-auto mb-2 opacity-30" />
                No entries yet for {warehouse}
            </TableCell>
        </TableRow>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

const StockHistoryList = () => {
    const user = useUserStore(state => state.currentUser);
    const warehouse = getUserWarehouse(user?.warehouse ?? '');

    const stock_history = useStockStore(state => state.stock_history);
    const addToHistory = useStockStore(state => state.add_item_to_history);

    const [showLimit, setShowLimit] = useState(SHOW_LIMIT_DEFAULT);
    const isExpanded = showLimit >= SHOW_LIMIT_EXPANDED;

    const { mutate: handleDelete } = useMutation({
        mutationFn: async (item: IHistoryStockItem) => {
            const reversed = { ...item, quantity: -item.quantity };
            const response = await StockService.addStockHistory(reversed);
            addToHistory(response);
            await StockService.addStockRecord(reversed);
        },
        onSuccess: () => toast.success('Item was successfully added to Stock'),
        onError: (err: Error) => toast.error(err.message),
    });

    if (!stock_history) return null;

    const isLeader = warehouse.toLowerCase() === 'leader';

    const sorted = [...stock_history]
        .filter(item => isLeader || item.warehouse === warehouse)
        .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
        .slice(0, showLimit);

    return (
        <div className="overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-center gap-2 p-2">
                <p className="px-2 py-2 text-xs font-medium text-muted-foreground">
                    Historical data for your current warehouse only.
                </p>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                        <SquareArrowOutUpRight size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowLimit(isExpanded ? SHOW_LIMIT_DEFAULT : SHOW_LIMIT_EXPANDED)}
                    >
                        {isExpanded ? <ArrowUpFromLine size={16} /> : <ArrowDownFromLine size={16} />}
                    </Button>
                </div>
            </div>

            <div className="overflow-auto flex-1 p-2">
                <ScrollArea className="h-[75dvh] md:h-[82dvh] w-full rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs">Employee</TableHead>
                                <TableHead className="text-xs hidden sm:table-cell">Warehouse</TableHead>
                                <TableHead className="text-xs hidden md:table-cell">Location</TableHead>
                                <TableHead className="text-xs">Qty</TableHead>
                                <TableHead className="text-xs">Material</TableHead>
                                <TableHead className="text-xs hidden sm:table-cell">Robot</TableHead>
                                <TableHead className="text-xs hidden sm:table-cell">Time</TableHead>
                                <TableHead className="text-xs w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sorted.length === 0
                                ? <EmptyRow warehouse={warehouse} />
                                : sorted.map(el => (
                                    <TableRow key={el.id}>
                                        <TableCell className="text-sm font-medium">
                                        <span className="flex items-center gap-2">
                                            <User size={16} />
                                            {el.user.user_name}
                                        </span>
                                        </TableCell>

                                        <TableCell className="text-sm font-medium hidden sm:table-cell">
                                        <span className="flex items-center gap-2">
                                            <Warehouse size={16} />
                                            {el.warehouse}
                                        </span>
                                        </TableCell>

                                        <TableCell className="text-sm font-mono hidden md:table-cell">
                                            {el.location
                                                ? <p className={`flex items-center gap-2`}><MapPinHouse size={16} /> <LinkCell href="" label={el.location} /></p>
                                                : <Minus size={16} />
                                            }
                                        </TableCell>

                                        <QuantityCell quantity={el.quantity} />

                                        <TableCell className="text-sm font-mono max-w-[100px] truncate">
                                            <div className={`flex items-center gap-2`}><Wrench size={16} /> <LinkCell href="" label={el.material_number} /></div>
                                        </TableCell>

                                        <TableCell className="hidden sm:table-cell">
                                            {el.robot_data
                                                ? <div className={`flex items-center gap-2`}><Bot size={16} /> <LinkCell href="" label={el.robot_data.robot_number} /></div>
                                                : <Minus size={16} />
                                            }
                                        </TableCell>

                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                                            {timeToString(dayjs(el.created_at).valueOf())}
                                        </TableCell>

                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash2 size={13} />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(el)}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
    );
};

export default StockHistoryList;