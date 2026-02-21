'use client'
import React, {useMemo, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import {Input} from "@/components/ui/input";
import {getLocationsSummary} from "@/futures/stock/getLocationsSummary";
import {LocationStock, StockByLocationResponse} from "@/types/stock/SummaryItem";
import Link from "next/link";
import {Container, HandCoins, Loader2, PackageSearch, Warehouse} from "lucide-react";
import SearchStockTemplate from "@/components/shared/Search/SearchStockTemplate";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {usePersistedTab} from "@/hooks/usePersistedTab";

const WAREHOUSES = ["all", "GLPC", "SMALL_P3", "PNT", "P3"] as const;
type Warehouse = typeof WAREHOUSES[number];
const WAREHOUSE_LABELS: Record<Warehouse, string> = {
    all:      "All",
    GLPC:     "GLPC",
    SMALL_P3: "SMALL P3",
    PNT:      "PNT",
    P3:      "P3",
};

const STORAGE_KEY = 'stock_sub_tab';
const DEFAULT_TAB = 'all';

const Page = () => {
    const [search_value,     setSearch_value]     = useState<string>("");
    const [picked_warehouse, setPickedWarehouse] = usePersistedTab<Warehouse>(
        STORAGE_KEY,
        DEFAULT_TAB,
        (v) => (WAREHOUSES as readonly string[]).includes(v) ? v as Warehouse : 'all'
    );
    const [rows_per_page,    setRowsPerPage]      = useState<number>(25);
    const [page,             setPage]             = useState<number>(1);

    const {data: LocationsSummary, isLoading, isError} = useQuery({
        queryKey: ['stockHistory-locations-full'],
        queryFn:  getLocationsSummary,
        retry: 3,
    });

    const filteredData = useMemo<StockByLocationResponse>(() => {
        if (!LocationsSummary) return [];
        let data = [...LocationsSummary];

        if (picked_warehouse !== "all") {
            data = data.filter(location =>
                location.items?.some(
                    item => item.warehouse?.toUpperCase() === picked_warehouse
                )
            );
        }

        const search = search_value.trim().toUpperCase();
        if (search.length > 0) {
            data = data
                .map(location => {
                    if (location.location?.toUpperCase().includes(search)) return location;

                    const filteredItems = location.items?.filter(item =>
                        item.material_number?.toUpperCase().includes(search) ||
                        item.description_eng?.toUpperCase().includes(search)
                    );

                    if (filteredItems?.length) return {...location, items: filteredItems};
                    return null;
                })
                .filter((l): l is LocationStock => l !== null);
        }

        return data.filter(location =>
            location.items?.some(item => item.total_quantity > 0)
        );
    }, [LocationsSummary, picked_warehouse, search_value]);

    const totalPages = Math.ceil(filteredData.length / rows_per_page);
    const paginatedData = useMemo(() =>
            filteredData.slice((page - 1) * rows_per_page, page * rows_per_page),
        [filteredData, page, rows_per_page]
    );

    const handleSearch = (v: string) => { setSearch_value(v); setPage(1); };
    const handleWarehouse = (v: string) => {
        localStorage.setItem(STORAGE_KEY, v);
        setPickedWarehouse(v as Warehouse);
        setPage(1);
    };

    if (isLoading) return (
        <div className="flex h-[50vh] items-center justify-center gap-2 text-muted-foreground">
            <Loader2 size={20} className="animate-spin"/> Loading stock...
        </div>
    );

    if (isError) return (
        <div className="flex h-[50vh] items-center justify-center text-destructive">
            Failed to load stock data.
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] items-start gap-6">

            {/* ── Left: Locations ── */}
            <div className="space-y-4">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Tabs value={picked_warehouse} onValueChange={handleWarehouse}>
                        <TabsList>
                            {WAREHOUSES.map(w => (
                                <TabsTrigger key={w} value={w}>
                                    {WAREHOUSE_LABELS[w]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page</span>
                        <Select
                            value={String(rows_per_page)}
                            onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}
                        >
                            <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent align="end">
                                <SelectGroup>
                                    {[10, 25, 50, 100].map(n => (
                                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {picked_warehouse === "all" && (
                    <p className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
                        ⚠ Showing results across all warehouses — consider filtering by warehouse for better performance.
                    </p>
                )}

                {/* Search */}
                <Input
                    value={search_value}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by location, material number or description..."
                />

                {/* Results count */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{paginatedData.length}</span> of{" "}
                        <span className="font-medium text-foreground">{filteredData.length}</span> locations
                    </p>
                    {search_value && (
                        <Badge variant="secondary" className="text-xs">
                            Search: &quot;{search_value}&quot;
                        </Badge>
                    )}
                </div>

                {/* Grid */}
                {paginatedData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground rounded-xl border-2 border-dashed border-muted-foreground/20">
                        <PackageSearch size={32} className="opacity-30"/>
                        <p className="text-sm">No locations found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {paginatedData.map((el) => {
                            const visibleItems = el.items.filter(i => i.total_quantity > 0);
                            if (visibleItems.length === 0) return null;

                            const locationLabel = el.location.split('-')[1]?.toUpperCase() ?? el.location;

                            return (
                                <Link
                                    href={`/stock/cell?location=${el.location}&warehouse=${el.items[0]?.warehouse ?? ''}`}
                                    key={el.location}
                                    className="group rounded-xl border bg-card p-4 hover:bg-muted/50 hover:border-primary/30 transition-all"
                                >
                                    {/* Card header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                                                <Container size={14} className="text-muted-foreground group-hover:text-primary transition-colors"/>
                                            </div>
                                            <span className="text-sm font-semibold">{locationLabel}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Warehouse size={12}/>
                                            <span>{el.items[0]?.warehouse}</span>
                                        </div>
                                    </div>

                                    {/* Parts */}
                                    <div className="flex flex-col gap-1.5">
                                        {visibleItems.slice(0, 5).map((part) => (
                                            <div
                                                key={part.material_number}
                                                className="flex items-center justify-between gap-2 text-xs"
                                            >
                                                <span className="text-muted-foreground font-mono shrink-0">
                                                    {part.material_number}
                                                </span>
                                                <span className="line-clamp-1 flex-1 text-muted-foreground/70">
                                                    {part.description_eng}
                                                </span>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <span className="font-semibold text-sm">{part.total_quantity}</span>
                                                    <HandCoins size={12} className="text-muted-foreground"/>
                                                </div>
                                            </div>
                                        ))}

                                        {visibleItems.length > 5 && (
                                            <p className="text-center text-[11px] text-muted-foreground mt-1 pt-1 border-t border-border">
                                                +{visibleItems.length - 5} more items
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                ← Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next →
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Right: Search panel ── */}
            <div className="lg:sticky lg:top-6">
                <SearchStockTemplate/>
            </div>
        </div>
    );
};

export default Page;