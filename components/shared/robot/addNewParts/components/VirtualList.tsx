"use client";

import React, { useEffect, useRef, useState } from "react";
import { IStockItemTemplate } from "@/types/stock/StockItem";
import PartItem from "./PartItem";
import {PAGE_SIZE} from "@/lib/helpers";

interface VirtualListProps {
    items: IStockItemTemplate[];
    selectedNumber: string | null;
    onSelect: (materialNumber: string) => void;
}

const VirtualList: React.FC<VirtualListProps> = ({ items, selectedNumber, onSelect }) => {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Reset to first page whenever the filtered list changes
    useEffect(() => setVisibleCount(PAGE_SIZE), [items]);

    // Load next page when sentinel enters viewport
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting)
                    setVisibleCount((n) => Math.min(n + PAGE_SIZE, items.length));
            },
            { threshold: 0.1 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [items.length]);

    return (
        <div className="space-y-0.5">
            {items.slice(0, visibleCount).map((item) => (
                <PartItem
                    key={item.id}
                    item={item}
                    isSelected={selectedNumber === item.material_number}
                    onSelect={onSelect}
                />
            ))}

            {visibleCount < items.length && (
                <div
                    ref={sentinelRef}
                    className="py-3 text-center text-xs text-muted-foreground/40"
                >
                    {items.length - visibleCount} more…
                </div>
            )}
        </div>
    );
};

export default VirtualList;