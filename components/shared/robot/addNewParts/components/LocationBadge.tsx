"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { IStockAmountItem } from "@/types/stock/StockAmounts";

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

export default LocationBadge;