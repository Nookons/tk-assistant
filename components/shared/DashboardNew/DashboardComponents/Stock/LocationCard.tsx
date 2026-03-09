import React from 'react';
import {Container, HandCoins, Warehouse} from "lucide-react";
import {LocationStock} from "@/types/stock/SummaryItem";

const ITEMS_PER_CARD = 4;

const LocationCard = ({ el, onClick }: { el: LocationStock; onClick: () => void }) => {
    const visibleItems = el.items.filter(i => i.total_quantity > 0);
    if (!visibleItems.length) return null;

    const locationLabel = el.location.split('-')[1]?.toUpperCase() ?? el.location;
    const warehouseName = el.items[0]?.warehouse ?? '';
    const overflow = visibleItems.length - ITEMS_PER_CARD;

    return (
        <button
            onClick={onClick}
            className="group flex flex-col rounded-xl border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all duration-200 text-left w-full"
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <Container size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">{locationLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 rounded-md px-2 py-1">
                    <Warehouse size={16} />
                    <span>{warehouseName}</span>
                </div>
            </div>

            <div className="flex flex-col px-4 py-2 flex-1">
                {visibleItems.slice(0, ITEMS_PER_CARD).map((part, idx) => (
                    <div
                        key={part.material_number}
                        className={`flex items-center gap-3 py-2 text-xs ${idx < Math.min(visibleItems.length, ITEMS_PER_CARD) - 1 ? 'border-b border-border/40' : ''}`}
                    >
                        <span className="font-mono text-muted-foreground shrink-0 w-24 truncate">
                            {part.material_number}
                        </span>
                        <span className="flex-1 text-muted-foreground/70 line-clamp-1 min-w-0">
                            {part.description_eng}
                        </span>
                        <div className="flex items-center gap-1 shrink-0 ml-auto">
                            <span className="font-semibold text-foreground tabular-nums">{part.total_quantity}</span>
                            <HandCoins size={11} className="text-muted-foreground/50" />
                        </div>
                    </div>
                ))}
            </div>

            {overflow > 0 && (
                <div className="px-4 py-2 border-t border-border/60 text-center">
                    <span className="text-[11px] text-muted-foreground/60">+{overflow} more items</span>
                </div>
            )}
        </button>
    );
};

export default LocationCard;