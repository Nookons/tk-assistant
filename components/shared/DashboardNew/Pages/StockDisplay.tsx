'use client'
import React, {useEffect, useMemo, useState} from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { getLocationsSummary } from '@/futures/stock/getLocationsSummary';
import { LocationItem, LocationStock, StockByLocationResponse } from '@/types/stock/SummaryItem';
import { Download, Loader2, PackageSearch, Search, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePersistedTab } from '@/hooks/usePersistedTab';
import LocationSheet from "@/components/shared/DashboardNew/DashboardComponents/Stock/LocationSheet";
import LocationCard from "@/components/shared/DashboardNew/DashboardComponents/Stock/LocationCard";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import InventoryDisplay from "@/components/shared/DashboardNew/DashboardComponents/Stock/InventoryDisplay";
import * as XLSX from 'xlsx';

const WAREHOUSES = ['all', 'GLPC', 'SMALL_P3', 'PNT', 'P3'] as const;
type Warehouse = typeof WAREHOUSES[number];

const WAREHOUSE_LABELS: Record<Warehouse, string> = {
    all: 'All', GLPC: 'GLPC', SMALL_P3: 'Small P3', PNT: 'PNT', P3: 'P3',
};

const STORAGE_KEY = 'stock_sub_tab';

function LoadingState() {
    return (
        <div className="flex h-[50vh] items-center justify-center gap-2 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading stock data…</span>
        </div>
    );
}

function ErrorState() {
    return (
        <div className="flex h-[50vh] items-center justify-center">
            <p className="text-sm text-destructive">Failed to load stock data.</p>
        </div>
    );
}

function EmptyState({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground rounded-xl border-2 border-dashed border-muted-foreground/15">
            <PackageSearch size={36} className="opacity-25" />
            <div className="text-center">
                <p className="text-sm font-medium">No locations found</p>
                {query && <p className="text-xs mt-0.5 opacity-60">No results for &ldquo;{query}&rdquo;</p>}
            </div>
        </div>
    );
}

function exportToExcel(data: StockByLocationResponse, warehouse: string) {
    const rows = data.flatMap(loc =>
        (loc.items ?? []).map(item => ({
            'Location':        item.location_key.split('-')[1]?.toUpperCase() ?? '',
            'Material Number': item.material_number ?? '',
            'Description':     item.description_eng ?? '',
            'Warehouse':       item.warehouse ?? '',
            'Total Quantity':  item.total_quantity ?? 0,
        }))
    );

    if (rows.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Авто-ширина колонок
    const colWidths = Object.keys(rows[0]).map(key => ({
        wch: Math.max(key.length, ...rows.map(r => String(r[key as keyof typeof r] ?? '').length)) + 2,
    }));
    worksheet['!cols'] = colWidths;

    // ── Сетка ─────────────────────────────────────────────────────────────────
    const borderStyle = {
        top:    { style: 'thin', color: { rgb: 'D1D5DB' } },
        bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
        left:   { style: 'thin', color: { rgb: 'D1D5DB' } },
        right:  { style: 'thin', color: { rgb: 'D1D5DB' } },
    };

    const headerFill = { fgColor: { rgb: 'F3F4F6' }, patternType: 'solid' as const };
    const headerFont = { bold: true };

    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

            if (!worksheet[cellAddress]) {
                worksheet[cellAddress] = { t: 's', v: '' };
            }

            worksheet[cellAddress].s = {
                border: borderStyle,
                ...(R === 0 && { fill: headerFill, font: headerFont }),
            };
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock');

    const warehouseLabel = warehouse === 'all' ? 'All' : warehouse;
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `stock_${warehouseLabel}_${date}.xlsx`);
}
// ─────────────────────────────────────────────────────────────────────────────

const Page = () => {
    const [searchValue, setSearchValue] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [page, setPage] = useState(1);
    const [pickedItem, setPickedItem] = useState<LocationStock | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const [stockData, setStockData] = useState<StockByLocationResponse>([]);

    const [pickedWarehouse, setPickedWarehouse] = usePersistedTab<Warehouse>(
        STORAGE_KEY, 'all',
        (v) => (WAREHOUSES as readonly string[]).includes(v) ? v as Warehouse : 'all'
    );

    const { data: locationsSummary, isLoading, isError } = useQuery({
        queryKey: ['stockHistory-locations-full'],
        queryFn: getLocationsSummary,
        retry: 3,
    });

    useEffect(() => {
        if (locationsSummary) setStockData(locationsSummary);
    }, [locationsSummary]);

    const handleLocationUpdate = (locationKey: string, newItems: LocationItem[]) => {
        setStockData(prev =>
            prev.map(loc =>
                loc.location === locationKey ? { ...loc, items: newItems } : loc
            )
        );
        setPickedItem(prev =>
            prev?.location === locationKey ? { ...prev, items: newItems } : prev
        );
    };

    const filteredData = useMemo<StockByLocationResponse>(() => {
        let data = [...stockData];

        if (pickedWarehouse !== 'all') {
            data = data.filter(loc =>
                loc.items?.some(item => item.warehouse?.toUpperCase() === pickedWarehouse)
            );
        }

        const search = searchValue.trim().toUpperCase();
        if (search) {
            data = data
                .map(loc => {
                    if (loc.location?.toUpperCase().includes(search)) return loc;
                    const filtered = loc.items?.filter(item =>
                        item.material_number?.toUpperCase().includes(search) ||
                        item.description_eng?.toUpperCase().includes(search)
                    );
                    return filtered?.length ? { ...loc, items: filtered } : null;
                })
                .filter((l): l is LocationStock => l !== null);
        }

        return data.filter(loc => loc.items?.some(i => i.total_quantity > 0));
    }, [stockData, pickedWarehouse, searchValue]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = useMemo(() =>
            filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage),
        [filteredData, page, rowsPerPage]
    );

    const handleSearch = (v: string) => { setSearchValue(v); setPage(1); };
    const handleWarehouse = (v: string) => {
        localStorage.setItem(STORAGE_KEY, v);
        setPickedWarehouse(v as Warehouse);
        setPage(1);
    };

    // Экспорт текущих отфильтрованных данных
    const handleExport = () => {
        setIsExporting(true);
        try {
            exportToExcel(filteredData, pickedWarehouse);
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState />;

    return (
        <div className="space-y-5">
            <LocationSheet
                el={pickedItem}
                onClose={() => setPickedItem(null)}
                onUpdate={handleLocationUpdate}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Tabs value={pickedWarehouse} onValueChange={handleWarehouse}>
                    <TabsList className="h-9">
                        {WAREHOUSES.map(w => (
                            <TabsTrigger key={w} value={w} className="text-xs px-3">
                                {WAREHOUSE_LABELS[w]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page</span>
                    <Select value={String(rowsPerPage)} onValueChange={v => { setRowsPerPage(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent align="end">
                            <SelectGroup>
                                {[10, 25, 50, 100].map(n => (
                                    <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* ── Export to Excel ── */}
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isExporting || filteredData.length === 0}
                        className="gap-1.5 text-xs"
                        title="Export filtered data to Excel"
                    >
                        {isExporting
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Download size={14} />
                        }
                        Excel
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round" className="lucide lucide-layers-plus">
                                    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 .83.18 2 2 0 0 0 .83-.18l8.58-3.9a1 1 0 0 0 0-1.831z"/>
                                    <path d="M16 17h6"/><path d="M19 14v6"/>
                                    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 .825.178"/>
                                    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l2.116-.962"/>
                                </svg>
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-[70vw]">
                            <InventoryDisplay />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {pickedWarehouse === 'all' && (
                <p className="text-xs text-amber-500 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2.5">
                    ⚠ Showing all warehouses — filter by warehouse for better performance.
                </p>
            )}

            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
                <Input
                    value={searchValue}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Search by location, material or description…"
                    className="pl-9 pr-9 h-9 text-sm"
                />
                {searchValue && (
                    <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{paginatedData.length}</span> of{' '}
                    <span className="font-medium text-foreground">{filteredData.length}</span> locations
                </p>
                {searchValue && (
                    <Badge variant="secondary" className="text-xs gap-1">
                        <Search size={10} />{searchValue}
                    </Badge>
                )}
            </div>

            {paginatedData.length === 0
                ? <EmptyState query={searchValue} />
                : (
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
                        {paginatedData.map((el, index) => (
                            <div key={`${el.location}-${index}`}>
                                <LocationCard el={el} onClick={() => setPickedItem(el)} />
                            </div>
                        ))}
                    </div>
                )
            }

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;