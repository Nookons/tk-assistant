"use client"
import React, {useMemo, useRef, useState} from 'react';
import {Input} from "@/components/ui/input";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {useStockStore} from "@/store/stock";
import StockItemPreview from "@/components/shared/Stock/StockItemPreview";
import CreateNewStockTemplate from "@/components/shared/Stock/CreateNewStockTemplate";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {PackageSearch, ChevronLeft, ChevronRight} from "lucide-react";

const PAGE_SIZE = 20;

const SearchStockTemplate = () => {
    const topRef = useRef<HTMLDivElement>(null);
    const stock_store = useStockStore(state => state.items_templates);
    const [value, setValue] = useState<string>("");
    const [page, setPage] = useState<number>(1);

    const filteredData = useMemo<IStockItemTemplate[]>(() => {
        if (!stock_store) return [];

        const trimmed = value.trim();
        if (trimmed.length === 0) return stock_store;

        const searchTerms = trimmed.toUpperCase().split(/\s+/);

        return stock_store
            .map(item => {
                const materialNumber = item.material_number?.toUpperCase() ?? "";
                const description    = item.description_eng?.toUpperCase()  ?? "";

                const matchCount = searchTerms.filter(term =>
                    materialNumber.includes(term) || description.includes(term)
                ).length;

                const startsWithBonus =
                    materialNumber.startsWith(searchTerms[0]) ? 2 :
                        description.startsWith(searchTerms[0])    ? 1 : 0;

                return {item, score: matchCount + startsWithBonus, matchCount};
            })
            .filter(r => r.matchCount === searchTerms.length)
            .sort((a, b) => b.score - a.score)
            .map(r => r.item);
    }, [value, stock_store]);

    // Сбрасываем страницу при изменении поиска
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        setPage(1);
    };

    const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageData = filteredData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const scrollToTopAndSetPage = (updater: (p: number) => number) => {
        topRef.current?.scrollIntoView({behavior: "smooth", block: "start"});
        setPage(updater);
    };

    if (!stock_store) return null;

    return (
        <div ref={topRef} className="rounded-xl">
            <div className={`grid md:grid-cols-[1fr_500px] items-center gap-2 mb-2`}>
                <div className="flex w-full items-end justify-end gap-2">
                    <CreateNewStockTemplate/>
                </div>

                <div className={`flex flex-col items-end md:flex-row md:items-center justify-end gap-4`}>
                    <div className={`w-full flex flex-col items-start gap-2`}>
                        <Input
                            value={value}
                            onChange={handleSearch}
                            placeholder="Material number or description..."
                        />
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => scrollToTopAndSetPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                            >
                                <ChevronLeft size={14}/>
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({length: totalPages}, (_, i) => i + 1)
                                    .filter(p =>
                                        p === 1 ||
                                        p === totalPages ||
                                        Math.abs(p - safePage) <= 1
                                    )
                                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, idx) =>
                                        p === "..." ? (
                                            <span key={`ellipsis-${idx}`} className="text-xs text-muted-foreground px-1">…</span>
                                        ) : (
                                            <Button
                                                key={p}
                                                variant={safePage === p ? "default" : "outline"}
                                                size="icon"
                                                className="h-7 w-7 text-xs"
                                                onClick={() => scrollToTopAndSetPage(() => p)}
                                            >
                                                {p}
                                            </Button>
                                        )
                                    )
                                }
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => scrollToTopAndSetPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                            >
                                <ChevronRight size={14}/>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {value && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Found <span className="font-medium text-foreground">{filteredData.length}</span> of{" "}
                        <span className="font-medium text-foreground">{stock_store.length}</span>
                    </p>
                    {totalPages > 1 && (
                        <Badge variant="secondary" className="text-[10px]">
                            Page {safePage} of {totalPages}
                        </Badge>
                    )}
                </div>
            )}


            {filteredData.length === 0 && value ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                    <PackageSearch size={28} className="opacity-30"/>
                    <p className="text-xs">No parts found for &quot;{value}&quot;</p>
                </div>
            ) : (
                <>
                    <div className={`grid ${pageData.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'} gap-2`}>
                        {pageData.map((part) => (
                            <StockItemPreview key={part.material_number} data={part}/>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchStockTemplate;