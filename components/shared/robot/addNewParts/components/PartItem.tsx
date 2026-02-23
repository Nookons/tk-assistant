"use client";

import React, { memo } from "react";
import { Check } from "lucide-react";
import { IStockItemTemplate } from "@/types/stock/StockItem";

interface PartItemProps {
    item: IStockItemTemplate;
    isSelected: boolean;
    onSelect: (materialNumber: string) => void;
}

const PartItem = memo<PartItemProps>(({ item, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(item.material_number)}
        className={`
      w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg
      transition-colors duration-100 border
      ${isSelected
            ? "bg-primary/8 border-primary/25"
            : "border-transparent hover:bg-muted/60"
        }
    `}
    >
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate leading-snug">
                {item.description_eng ?? item.description_orginall}
            </p>
            <p className="text-xs font-bold text-muted-foreground/70 font-mono truncate mt-0.5">
                {item.material_number}
            </p>
        </div>
        <Check
            className={`h-4 w-4 shrink-0 text-primary transition-all duration-150 ${
                isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
        />
    </button>
));

PartItem.displayName = "PartItem";
export default PartItem;