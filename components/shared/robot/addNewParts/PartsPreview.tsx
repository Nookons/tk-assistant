"use client";

import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from "@/components/ui/empty";

import { IStockItemTemplate } from "@/types/stock/StockItem";
import { IStockAmountItem } from "@/types/stock/StockAmounts";
import { getPartByNumber } from "@/futures/stock/getPartByNumber";
import PartCard from "@/components/shared/robot/addNewParts/components/PartCard";


interface PartsPreviewProps {
    part_number: string | null;
    amounts: IStockAmountItem[];
    pickedLocation: IStockAmountItem | null;
    onPickLocation: (item: IStockAmountItem) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PartsPreview: React.FC<PartsPreviewProps> = ({
                                                       part_number,
                                                       amounts,
                                                       pickedLocation,
                                                       onPickLocation,
                                                   }) => {
    const [partData, setPartData] = useState<IStockItemTemplate | null>(null);

    useEffect(() => {
        if (!part_number) {
            setPartData(null);
            return;
        }

        let cancelled = false;

        getPartByNumber(part_number)
            .then((results) => {
                if (!cancelled) {
                    const item = Array.isArray(results) ? results[0] ?? null : results ?? null;
                    setPartData(item as IStockItemTemplate | null);
                }
            })
            .catch(() => console.error("Failed to load part details."));

        return () => { cancelled = true; };
    }, [part_number]);

    // ── Empty state ──────────────────────────────────────────────────────────

    if (!part_number) {
        return (
            <Empty className="h-44 rounded-xl border border-dashed border-border/40">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Package className="h-5 w-5 text-muted-foreground/40" />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm">No part selected</EmptyTitle>
                    <EmptyDescription className="text-xs">
                        Choose a part from the catalogue above.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    if (!partData) return null;

    return (
        <ScrollArea className="max-h-[500px] md:max-h-[680px]">
            <div className="pb-1 pr-1">
                <PartCard
                    item={partData}
                    amounts={amounts}
                    pickedLocation={pickedLocation}
                    onPickLocation={onPickLocation}
                />
            </div>
        </ScrollArea>
    );
};

export default PartsPreview;