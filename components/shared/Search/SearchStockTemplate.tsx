"use client"
import React, {useMemo, useState} from 'react';
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {Separator} from "@/components/ui/separator";
import {useStockStore} from "@/store/stock";
import StockItemPreview from "@/components/shared/Stock/StockItemPreview";
import CreateNewStockTemplate from "@/components/shared/Stock/CreateNewStockTemplate";
import {Badge} from "@/components/ui/badge";
import {PackageSearch} from "lucide-react";

const PREVIEW_LIMIT = 10;

// ── Component ─────────────────────────────────────────────────────────────────

const SearchStockTemplate = () => {
    const stock_store = useStockStore(state => state.items_templates);
    const [value, setValue] = useState<string>("");

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

    if (!stock_store) return null;

    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold">Parts Catalogue</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {stock_store.length} parts available
                    </p>
                </div>
                <CreateNewStockTemplate/>
            </div>

            {/* Search */}
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Material number or description..."
            />

            {/* Results count */}
            {value && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Found <span className="font-medium text-foreground">{filteredData.length}</span> of{" "}
                        <span className="font-medium text-foreground">{stock_store.length}</span>
                    </p>
                    {filteredData.length > PREVIEW_LIMIT && (
                        <Badge variant="secondary" className="text-[10px]">
                            Showing top {PREVIEW_LIMIT}
                        </Badge>
                    )}
                </div>
            )}

            <Separator/>

            {/* Results */}
            {filteredData.length === 0 && value ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                    <PackageSearch size={28} className="opacity-30"/>
                    <p className="text-xs">No parts found for &quot;{value}&quot;</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredData.slice(0, PREVIEW_LIMIT).map((part) => (
                        <StockItemPreview key={part.material_number} data={part}/>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchStockTemplate;