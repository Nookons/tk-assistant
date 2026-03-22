'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    Download, Loader2, Minus,
    Package, SquareArrowOutUpRight, User,
} from 'lucide-react';

import { useUserStore } from '@/store/user';
import { useStockStore } from '@/store/stock';
import { getUserWarehouse } from '@/utils/getUserWarehouse';
import { timeToString } from '@/utils/timeToString';
import { StockService } from '@/services/stockService';
import { IHistoryStockItem } from '@/types/stock/HistoryStock';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table';


const SHOW_LIMIT_DEFAULT = 25;
const PAGE_SIZE          = 50;

const TODAY = dayjs().format('YYYY-MM-DD');


interface StockHistoryListProps {
    isShort: boolean;
}


const QuantityCell = ({ quantity }: { quantity: number }) => (
    <TableCell
        className={`text-sm font-semibold tabular-nums ${
            quantity < 0 ? 'text-destructive' : 'text-emerald-500'
        }`}
    >
        {quantity > 0 ? `+${quantity.toLocaleString()}` : quantity.toLocaleString()}
    </TableCell>
);

const LinkedCell = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className="font-medium text-blue-500 hover:underline">
        {label}
    </Link>
);

const EmptyRow = ({ warehouse }: { warehouse: string }) => (
    <TableRow>
        <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
            <Package size={24} className="mx-auto mb-2 opacity-30" aria-hidden="true" />
            No entries yet for {warehouse}
        </TableCell>
    </TableRow>
);


interface ToolbarProps {
    isShort:       boolean;
    isOnlyUsed:    boolean;
    isOnlyToday:   boolean;
    isExporting:   boolean;
    canExport:     boolean;
    onUsedChange:  (v: boolean) => void;
    onTodayChange: (v: boolean) => void;
    onExport:      () => void;
}

const Toolbar = ({
                     isShort, isOnlyUsed, isOnlyToday,
                     isExporting, canExport,
                     onUsedChange, onTodayChange, onExport,
                 }: ToolbarProps) => (
    <div className="flex items-center justify-end gap-2 p-2 shrink-0 border-b">
        <div className="flex items-center gap-1.5 mr-2">
            <Switch
                id="filter-used"
                checked={isOnlyUsed}
                onCheckedChange={onUsedChange}
            />
            <Label htmlFor="filter-used" className="text-xs cursor-pointer">Used</Label>
        </div>

        <div className="flex items-center gap-1.5 mr-2">
            <Switch
                id="filter-today"
                checked={isOnlyToday}
                onCheckedChange={onTodayChange}
            />
            <Label htmlFor="filter-today" className="text-xs cursor-pointer">Today</Label>
        </div>

        <Button
            variant="ghost"
            size="icon"
            onClick={onExport}
            disabled={isExporting || !canExport}
            title="Export filtered data to Excel"
            aria-label="Export to Excel"
        >
            {isExporting
                ? <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                : <Download size={14} aria-hidden="true" />
            }
        </Button>

        {isShort && (
            <Link href="/stock/stock-history">
                <Button variant="ghost" size="icon" aria-label="Open full history">
                    <SquareArrowOutUpRight size={16} aria-hidden="true" />
                </Button>
            </Link>
        )}
    </div>
);


interface PaginationProps {
    page:       number;
    totalPages: number;
    totalRows:  number;
    onPrev:     () => void;
    onNext:     () => void;
}

const Pagination = ({ page, totalPages, totalRows, onPrev, onNext }: PaginationProps) => (
    <div className="flex items-center justify-between px-4 py-3 border-t shrink-0">
        <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {totalRows} entries
        </span>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 1}>
                ← Prev
            </Button>
            <Button variant="outline" size="sm" onClick={onNext} disabled={page === totalPages}>
                Next →
            </Button>
        </div>
    </div>
);


const StockHistoryList = ({ isShort }: StockHistoryListProps) => {
    const currentUser  = useUserStore(state => state.currentUser);
    const warehouse    = getUserWarehouse(currentUser?.warehouse ?? '');

    const stockHistory    = useStockStore(state => state.stock_history);
    const addItemToHistory = useStockStore(state => state.add_item_to_history);

    const [showLimit,    setShowLimit]    = useState(SHOW_LIMIT_DEFAULT);
    const [page,         setPage]         = useState(1);
    const [isExporting,  setIsExporting]  = useState(false);
    const [isOnlyUsed,   setIsOnlyUsed]   = useState(false);
    const [isOnlyToday,  setIsOnlyToday]  = useState(false);


    const { mutate: handleDelete } = useMutation({
        mutationFn: async (item: IHistoryStockItem) => {
            const reversed = { ...item, quantity: -item.quantity };
            const response = await StockService.addStockHistory(reversed);
            addItemToHistory(response);
            await StockService.addStockRecord(reversed);
        },
        onSuccess: () => toast.success('Item was successfully reversed in Stock'),
        onError:   (err: Error) => toast.error(err.message),
    });

    const handleExport = async () => {
        // TODO: implement Excel export
        setIsExporting(false);
    };

    // ── Filtering & sorting ──────────────────────────────────────────────────

    if (!stockHistory) return null;

    const sorted = [...stockHistory]
        .filter(item => (isOnlyUsed  ? item.quantity < 0 : true))
        .filter(item => (isOnlyToday ? dayjs(item.created_at).format('YYYY-MM-DD') === TODAY : true))
        .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

    const paginated = isShort
        ? sorted.slice(0, showLimit)
        : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleFilterChange = (setter: (v: boolean) => void) => (v: boolean) => {
        setter(v);
        setPage(1);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Toolbar
                isShort={isShort}
                isOnlyUsed={isOnlyUsed}
                isOnlyToday={isOnlyToday}
                isExporting={isExporting}
                canExport={paginated.length > 0}
                onUsedChange={handleFilterChange(setIsOnlyUsed)}
                onTodayChange={handleFilterChange(setIsOnlyToday)}
                onExport={handleExport}
            />

            {!isShort && totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalRows={sorted.length}
                    onPrev={() => setPage(p => p - 1)}
                    onNext={() => setPage(p => p + 1)}
                />
            )}

            <div className="flex-1 min-h-0 p-2">
                <ScrollArea className="h-full w-full rounded-md border">
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
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginated.length === 0 ? (
                                <EmptyRow warehouse={warehouse} />
                            ) : (
                                paginated.map(el => (
                                    <TableRow key={el.id}>
                                        <TableCell className="text-sm font-medium">
                                            <span className="flex items-center gap-2">
                                                <User size={16} aria-hidden="true" />
                                                {el.user.user_name}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-sm font-medium hidden sm:table-cell">
                                            {el.warehouse}
                                        </TableCell>

                                        <TableCell className="text-sm font-mono hidden md:table-cell">
                                            {el.location ? (
                                                <LinkedCell
                                                    href={`/stock/cell?location=${el.warehouse.toLowerCase()}-${el.location.toLowerCase()}&warehouse=${el.warehouse.toUpperCase()}`}
                                                    label={el.location}
                                                />
                                            ) : (
                                                <Minus size={16} aria-label="No location" />
                                            )}
                                        </TableCell>

                                        <QuantityCell quantity={el.quantity} />

                                        <TableCell className="max-w-[100px] truncate text-sm font-mono">
                                            <LinkedCell href="" label={el.material_number} />
                                        </TableCell>

                                        <TableCell className="hidden sm:table-cell">
                                            {el.robot_data ? (
                                                <LinkedCell
                                                    href={`/robot/${el.robot_data.id}`}
                                                    label={el.robot_data.robot_number}
                                                />
                                            ) : (
                                                <Minus size={16} aria-label="No robot" />
                                            )}
                                        </TableCell>

                                        <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">
                                            {timeToString(dayjs(el.created_at).valueOf())}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
    );
};

export default StockHistoryList;