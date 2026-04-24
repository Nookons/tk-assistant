'use client'
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    Download, Loader2, Minus,
    Package, SquareArrowOutUpRight, X,
} from 'lucide-react';

import { useUserStore } from '@/store/user';
import { useStockStore } from '@/store/stock';
import { getUserWarehouse } from '@/utils/getUserWarehouse';
import { timeToString } from '@/utils/timeToString';
import { StockService } from '@/services/stockService';
import { IHistoryStockItem } from '@/types/stock/HistoryStock';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import UserAvatar from '@/components/shared/User/UserAvatar';

dayjs.extend(isBetween);

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;
const SHOW_LIMIT_DEFAULT = 25;
const TODAY = dayjs().format('YYYY-MM-DD');
const WEEK_START = dayjs().startOf('week').format('YYYY-MM-DD');

// ── Types ─────────────────────────────────────────────────────────────────────

type OperationType = 'all' | 'added' | 'used';
type DatePreset = 'all' | 'today' | 'week' | 'custom';

interface Filters {
    search: string;           // material_number | user_name
    warehouse: string;        // '' = all
    operation: OperationType;
    datePreset: DatePreset;
    dateFrom: string;         // YYYY-MM-DD, used when preset === 'custom'
    dateTo: string;           // YYYY-MM-DD, used when preset === 'custom'
    hasRobot: boolean;        // true = only rows with robot
    hasLocation: boolean;     // true = only rows with location
}

const DEFAULT_FILTERS: Filters = {
    search: '',
    warehouse: '',
    operation: 'all',
    datePreset: 'all',
    dateFrom: TODAY,
    dateTo: TODAY,
    hasRobot: false,
    hasLocation: false,
};

interface StockHistoryListProps {
    isShort: boolean;
}

// ── Small shared cells ────────────────────────────────────────────────────────

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
    <Link href={href} className="font-medium hover:text-blue-500 hover:underline">
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

// ── Filter helpers ────────────────────────────────────────────────────────────

function applyFilters(items: IHistoryStockItem[], f: Filters): IHistoryStockItem[] {
    const search = f.search.trim().toLowerCase();

    return items.filter(item => {
        // Full-text search: material_number OR user_name
        if (search) {
            const inMaterial = item.material_number.toLowerCase().includes(search);
            const inUser = item.user.user_name.toLowerCase().includes(search);
            if (!inMaterial && !inUser) return false;
        }

        // Warehouse
        if (f.warehouse && item.warehouse !== f.warehouse) return false;

        // Operation
        if (f.operation === 'added' && item.quantity <= 0) return false;
        if (f.operation === 'used' && item.quantity >= 0) return false;

        // Date
        const itemDate = dayjs(item.created_at).format('YYYY-MM-DD');
        if (f.datePreset === 'today' && itemDate !== TODAY) return false;
        if (f.datePreset === 'week' && !(itemDate >= WEEK_START && itemDate <= TODAY)) return false;
        if (
            f.datePreset === 'custom' &&
            f.dateFrom &&
            f.dateTo &&
            !(itemDate >= f.dateFrom && itemDate <= f.dateTo)
        ) return false;

        // Has robot
        if (f.hasRobot && !item.robot_data) return false;

        // Has location
        if (f.hasLocation && !item.location) return false;

        return true;
    });
}

function countActiveFilters(f: Filters): number {
    let n = 0;
    if (f.search) n++;
    if (f.warehouse) n++;
    if (f.operation !== 'all') n++;
    if (f.datePreset !== 'all') n++;
    if (f.hasRobot) n++;
    if (f.hasLocation) n++;
    return n;
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

interface ToolbarProps {
    isShort: boolean;
    filters: Filters;
    warehouses: string[];
    activeCount: number;
    isExporting: boolean;
    canExport: boolean;
    onChange: (patch: Partial<Filters>) => void;
    onReset: () => void;
    onExport: () => void;
}

const Toolbar = ({
                     isShort, filters, warehouses, activeCount,
                     isExporting, canExport,
                     onChange, onReset, onExport,
                 }: ToolbarProps) => (
    <div className="flex flex-col gap-2 p-2 shrink-0 border-b">

        {/* Row 1 — search + warehouse + operation */}
        <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
                <Input
                    placeholder="Material or employee…"
                    value={filters.search}
                    onChange={e => onChange({ search: e.target.value })}
                    className="h-8 text-xs pr-7"
                />
                {filters.search && (
                    <button
                        onClick={() => onChange({ search: '' })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Warehouse */}
            <Select
                value={filters.warehouse || '__all__'}
                onValueChange={v => onChange({ warehouse: v === '__all__' ? '' : v })}
            >
                <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue placeholder="All warehouses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__all__">All warehouses</SelectItem>
                    {warehouses.map(w => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Operation */}
            <Select
                value={filters.operation}
                onValueChange={v => onChange({ operation: v as OperationType })}
            >
                <SelectTrigger className="h-8 w-[110px] text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All moves</SelectItem>
                    <SelectItem value="added">Added (+)</SelectItem>
                    <SelectItem value="used">Used (−)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* Row 2 — date + toggles + actions */}
        <div className="flex flex-wrap items-center gap-2">

            {/* Date preset */}
            <Select
                value={filters.datePreset}
                onValueChange={v => onChange({ datePreset: v as DatePreset })}
            >
                <SelectTrigger className="h-8 w-[110px] text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="custom">Custom…</SelectItem>
                </SelectContent>
            </Select>

            {/* Custom date range — shown only when preset === 'custom' */}
            {filters.datePreset === 'custom' && (
                <>
                    <Input
                        type="date"
                        value={filters.dateFrom}
                        max={filters.dateTo || TODAY}
                        onChange={e => onChange({ dateFrom: e.target.value })}
                        className="h-8 w-[130px] text-xs"
                        aria-label="From date"
                    />
                    <span className="text-xs text-muted-foreground">–</span>
                    <Input
                        type="date"
                        value={filters.dateTo}
                        min={filters.dateFrom}
                        max={TODAY}
                        onChange={e => onChange({ dateTo: e.target.value })}
                        className="h-8 w-[130px] text-xs"
                        aria-label="To date"
                    />
                </>
            )}

            {/* Has robot */}
            <div className="flex items-center gap-1.5">
                <Switch
                    id="filter-robot"
                    checked={filters.hasRobot}
                    onCheckedChange={v => onChange({ hasRobot: v })}
                />
                <Label htmlFor="filter-robot" className="text-xs cursor-pointer">Robot</Label>
            </div>

            {/* Has location */}
            <div className="flex items-center gap-1.5">
                <Switch
                    id="filter-location"
                    checked={filters.hasLocation}
                    onCheckedChange={v => onChange({ hasLocation: v })}
                />
                <Label htmlFor="filter-location" className="text-xs cursor-pointer">Location</Label>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Reset badge */}
            {activeCount > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={onReset}
                >
                    <X size={12} />
                    Reset
                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                        {activeCount}
                    </Badge>
                </Button>
            )}

            {/* Export */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open full history">
                        <SquareArrowOutUpRight size={16} aria-hidden="true" />
                    </Button>
                </Link>
            )}
        </div>
    </div>
);

// ── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
    page: number;
    totalPages: number;
    totalRows: number;
    onPrev: () => void;
    onNext: () => void;
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

// ── Main component ────────────────────────────────────────────────────────────

const StockHistoryList = ({ isShort }: StockHistoryListProps) => {
    const currentUser = useUserStore(state => state.currentUser);
    const warehouse = getUserWarehouse(currentUser?.warehouse ?? '');

    const stockHistory = useStockStore(state => state.stock_history);
    const addItemToHistory = useStockStore(state => state.add_item_to_history);

    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);
    const [showLimit] = useState(SHOW_LIMIT_DEFAULT);
    const [isExporting, setIsExporting] = useState(false);

    // Patch filters and reset page to 1
    const patchFilters = (patch: Partial<Filters>) => {
        setFilters(prev => ({ ...prev, ...patch }));
        setPage(1);
    };

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        setPage(1);
    };

    const { mutate: handleDelete } = useMutation({
        mutationFn: async (item: IHistoryStockItem) => {
            const reversed = { ...item, quantity: -item.quantity };
            const response = await StockService.addStockHistory(reversed);
            addItemToHistory(response);
            await StockService.addStockRecord(reversed);
        },
        onSuccess: () => toast.success('Item was successfully reversed in Stock'),
        onError: (err: Error) => toast.error(err.message),
    });

    const handleExport = async () => {
        // TODO: implement Excel export
        setIsExporting(false);
    };

    // ── Derived data ──────────────────────────────────────────────────────────

    if (!stockHistory) return null;

    // Unique warehouses for the dropdown (derived from data, stable between renders)
    const warehouses = useMemo(
        () => [...new Set(stockHistory.map(i => i.warehouse))].sort(),
        [stockHistory],
    );

    const sorted = useMemo(
        () =>
            [...stockHistory].sort(
                (a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf(),
            ),
        [stockHistory],
    );

    const filtered = useMemo(() => applyFilters(sorted, filters), [sorted, filters]);

    const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    const paginated = isShort
        ? filtered.slice(0, showLimit)
        : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Toolbar
                isShort={isShort}
                filters={filters}
                warehouses={warehouses}
                activeCount={activeCount}
                isExporting={isExporting}
                canExport={paginated.length > 0}
                onChange={patchFilters}
                onReset={resetFilters}
                onExport={handleExport}
            />

            {!isShort && totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalRows={filtered.length}
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
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl overflow-hidden">
                                                    <UserAvatar user={el.user} allowFullscreen />
                                                </div>
                                                <LinkedCell
                                                    href={`/user/${el.user.auth_id}`}
                                                    label={el.user.user_name}
                                                />
                                            </div>
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
                                            <LinkedCell
                                                href={`/stock-item/${el.material_number}`}
                                                label={el.material_number}
                                            />
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