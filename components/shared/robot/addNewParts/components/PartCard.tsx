"use client";

import React from "react";
import dayjs from "dayjs";
import { Package, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IStockItemTemplate } from "@/types/stock/StockItem";
import { IStockAmountItem } from "@/types/stock/StockAmounts";
import LocationBadge from "./LocationBadge";

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
            <div className="flex items-center gap-3 px-3.5 py-2.5 border-b border-border/30 bg-muted/20">
                <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5">
                    {item.material_number}
                </Badge>
            </div>

            {/* Body */}
            <div className="px-3.5 py-3 space-y-3">
                {/* Part info */}
                <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border/30 w-12 h-12">
                        {item.avatar_url ? (
                            <img
                                src={item.avatar_url}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Package className="w-6 h-6 text-muted-foreground/50" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">
                            {item.description_eng ?? item.description_orginall}
                        </p>
                        {hasAltName && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {item.description_orginall}
                            </p>
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
                                    key={`${amount.warehouse}-${amount.location}`}
                                    amount={amount}
                                    isSelected={
                                        pickedLocation?.location === amount.location &&
                                        pickedLocation?.warehouse === amount.warehouse
                                    }
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

export default PartCard;