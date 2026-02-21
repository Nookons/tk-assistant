"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Package, TriangleAlert } from "lucide-react";
import dayjs from "dayjs";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

import { IStockItemTemplate } from "@/types/stock/StockItem";
import { IStockAmountItem } from "@/types/stock/StockAmounts";
import { getPartByNumber } from "@/futures/stock/getPartByNumber";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PartsPreviewProps {
    parts_data: string[];
    selected_amounts: IStockAmountItem[];
    picked_location: IStockAmountItem | null;
    setPicked_location: (item: IStockAmountItem) => void;
}

// ─── LocationBadge ────────────────────────────────────────────────────────────

interface LocationBadgeProps {
    amount: IStockAmountItem;
    isSelected: boolean;
    onSelect: () => void;
}

const LocationBadge: React.FC<LocationBadgeProps> = ({ amount, isSelected, onSelect }) => (
    <label
        className={`
            flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer
            transition-all duration-150 select-none
            ${isSelected
            ? "border-primary/50 bg-primary/8 text-foreground"
            : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/60"
        }
        `}
    >
        <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="h-3.5 w-3.5"
        />
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="font-mono">{amount.location}</span>
        <span className={`font-semibold tabular-nums ${isSelected ? "text-primary" : "text-foreground"}`}>
            ×{amount.quantity.toLocaleString()}
        </span>
    </label>
);

// ─── PartCard ─────────────────────────────────────────────────────────────────

interface PartCardProps {
    item: IStockItemTemplate;
    amounts: IStockAmountItem[];
    pickedLocation: IStockAmountItem | null;
    onPickLocation: (item: IStockAmountItem) => void;
}

const PartCard: React.FC<PartCardProps> = ({ item, amounts, pickedLocation, onPickLocation }) => {
    const hasAltName =
        item.description_eng &&
        item.description_orginall &&
        item.description_eng !== item.description_orginall;

    return (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-border/30 bg-muted/20">
                <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5">
                    {item.material_number}
                </Badge>
                {item.user?.user_name && (
                    <span className="text-[10px] text-muted-foreground/60 truncate">
                        {item.user.user_name}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="px-3.5 py-3 space-y-3">
                <div className="flex items-start gap-2">
                    <div className="shrink-0 rounded-md overflow-hidden bg-muted flex items-start justify-center border border-border/30">
                        {item.avatar_url ? (
                            <img
                                src={item.avatar_url}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-12 h-12 object-cover"
                            />
                        ) : (
                            <Package className="w-12 h-12 text-muted-foreground/50" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium leading-snug">
                            {item.description_eng ?? item.description_orginall}
                        </p>
                        {hasAltName && (
                            <p className="text-xs text-muted-foreground">{item.description_orginall}</p>
                        )}
                    </div>
                </div>

                {/* Locations */}
                {amounts.length > 0 ? (
                    <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">
                            Warehouse locations
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {amounts.map((amount) => (
                                <LocationBadge
                                    key={`${amount.location}-${amount.warehouse}`}
                                    amount={amount}
                                    isSelected={pickedLocation?.location === amount.location}
                                    onSelect={() => onPickLocation(amount)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-500/80 bg-amber-500/8 rounded-lg px-2.5 py-2 border border-amber-500/20">
                        <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                        No stock available in this warehouse
                    </div>
                )}

                {/* Timestamp */}
                <p className="text-[10px] text-muted-foreground/40">
                    Updated · {dayjs(item.updated_at).format("HH:mm · MMM D, YYYY")}
                </p>
            </div>
        </div>
    );
};

// ─── PartsPreview ─────────────────────────────────────────────────────────────

const PartsPreview: React.FC<PartsPreviewProps> = ({
                                                       parts_data,
                                                       selected_amounts,
                                                       picked_location,
                                                       setPicked_location,
                                                   }) => {
    const [previewData, setPreviewData] = useState<IStockItemTemplate[]>([]);

    useEffect(() => {
        if (!parts_data.length) {
            setPreviewData([]);
            return;
        }
        let cancelled = false;

        Promise.all(parts_data.map(getPartByNumber))
            .then((results) => {
                if (!cancelled) {
                    setPreviewData(results.flat().filter(Boolean) as IStockItemTemplate[]);
                }
            })
            .catch(() => console.error("Failed to load part details."));

        return () => { cancelled = true; };
    }, [parts_data]);

    if (!parts_data.length) {
        return (
            <Empty className="h-44 rounded-xl border border-dashed border-border/40">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Package className="h-5 w-5 text-muted-foreground/40" />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm">No parts selected</EmptyTitle>
                    <EmptyDescription className="text-xs">
                        Choose parts from the catalogue above.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Selected parts
            </label>

            <ScrollArea className="max-h-[500px] md:max-h-[680px]">
                <div className="space-y-2.5 pb-1 pr-1">
                    {previewData.map((item, index) => (
                        <PartCard
                            key={`${item.material_number}-${index}`}
                            item={item}
                            amounts={selected_amounts.filter(
                                (a) => a.material_number === item.material_number
                            )}
                            pickedLocation={picked_location}
                            onPickLocation={setPicked_location}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default PartsPreview;