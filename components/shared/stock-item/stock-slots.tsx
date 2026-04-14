import React, { useMemo } from 'react';
import Link from "next/link";
import { ExternalLink, Locate, Warehouse } from "lucide-react";
import dayjs from "dayjs";
import { useStockSlots } from "@/store/stock-slots";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import RemovePart from "@/components/shared/stock-item/RemovePart";
import MoveParts from "@/components/shared/stock-item/MoveParts";

function SectionTitle({ title, sub }: { title: string; sub: string }) {
    return (
        <div className="px-3 py-2 bg-muted/50 flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </span>
            <span className="text-base font-semibold uppercase tracking-wider">{sub}</span>
        </div>
    );
}

function SlotActions({ slot }: { slot: any }) {
    return (
        <ButtonGroup>
            <Button variant="outline" asChild>
                <Link
                    href={`/stock/cell?location=${encodeURIComponent(slot.location_key)}&warehouse=${encodeURIComponent(slot.warehouse)}`}
                >
                    <ExternalLink size={16} />
                </Link>
            </Button>
            <MoveParts slot={slot} />
            <RemovePart slot={slot} />
        </ButtonGroup>
    );
}

const StockSlots = ({ material_number }: { material_number: string }) => {
    const stock_slots = useStockSlots((state) => state.stock_slots);

    const sorted_data = useMemo(() => {
        if (!stock_slots) return null;
        return [...stock_slots]
            .filter((part) => part.material_number === material_number)
            .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());
    }, [stock_slots]);

    if (!sorted_data) return null;

    if (sorted_data.length === 0) {
        return (
            <div className="border rounded-xl px-4 py-8 flex flex-col items-center gap-2 text-muted-foreground">
                <Warehouse size={32} className="opacity-40" />
                <span className="text-sm">No stock locations found</span>
            </div>
        );
    }

    const total = sorted_data.reduce((acc, curr) => acc + curr.quantity, 0);

    return (
        <div className="border rounded-xl overflow-hidden">
            <SectionTitle title="Total" sub={total.toLocaleString()} />

            <div className="divide-y">
                {sorted_data.map((slot) => (
                    <div
                        key={slot.id}
                        className="group relative px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                        <div className="hidden md:flex absolute inset-0 opacity-0 group-hover:opacity-100 backdrop-blur-xl bg-background/75 justify-end p-2 items-center transition-opacity z-10">
                            <SlotActions slot={slot} />
                        </div>

                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Warehouse size={16} />
                                    <span>{slot.warehouse}</span>
                                </div>
                                {slot.location && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Locate size={14} />
                                        <span>{slot.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-sm font-semibold">{slot.quantity}</span>
                                <span className="text-xs text-muted-foreground">
                                    {dayjs(slot.updated_at).format("DD MMM, HH:mm")}
                                </span>
                            </div>

                            <div className="md:hidden">
                                <SlotActions slot={slot} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockSlots;