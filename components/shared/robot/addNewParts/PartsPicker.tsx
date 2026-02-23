"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Sheet, SheetClose, SheetContent, SheetDescription,
    SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Loader2, Package, Wrench } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { IStockItemTemplate } from "@/types/stock/StockItem";
import { IStockAmountItem } from "@/types/stock/StockAmounts";
import { IRobot } from "@/types/robot/robot";
import { useUserStore } from "@/store/user";
import { useRobotsStore } from "@/store/robotsStore";
import { addChangeParts } from "@/futures/robots/addChangeParts";
import { getPartsAmounts } from "@/futures/stock/getPartsAmounts";

import PartsPreview from "./PartsPreview";
import {useDebounce} from "@/hooks/useDebounce";
import {buildSearchText, clampQty, DEBOUNCE_MS, matchesAllTerms, MIN_QTY} from "@/lib/helpers";
import VirtualList from "@/components/shared/robot/addNewParts/components/VirtualList";
import QuantityInput from "@/components/shared/robot/addNewParts/components/QuantityInput";
import {StockService} from "@/services/stockService";


interface PartsPickerProps {
    robot: IRobot;
}

const PartsPicker: React.FC<PartsPickerProps> = ({ robot }) => {
    const [parts, setParts]               = useState<IStockItemTemplate[]>([]);
    const [partsLoaded, setPartsLoaded]   = useState(false);
    const [partsLoading, setPartsLoading] = useState(false);

    const [selectedNumber, setSelectedNumber]   = useState<string | null>(null);
    const [quantity, setQuantity]               = useState<number>(1);
    const [amounts, setAmounts]                 = useState<IStockAmountItem[]>([]);
    const [pickedLocation, setPickedLocation]   = useState<IStockAmountItem | null>(null);

    const [rawSearch, setRawSearch]       = useState("");
    const searchQuery                     = useDebounce(rawSearch, DEBOUNCE_MS);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sheetOpen, setSheetOpen]       = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser     = useUserStore((s) => s.currentUser);
    const addPartsHistory = useRobotsStore((s) => s.addPartsHistory);


    const fetchParts = useCallback(async () => {
        if (partsLoaded || partsLoading) return;
        setPartsLoading(true);
        try {
            const res = await fetch(`/api/stock/get-robot-parts?robot_type=${robot.robot_type}`);
            if (!res.ok) throw new Error();
            setParts(await res.json());
            setPartsLoaded(true);
        } catch {
            toast.error("Failed to load parts catalogue.");
        } finally {
            setPartsLoading(false);
        }
    }, [partsLoaded, partsLoading, robot.robot_type]);


    useEffect(() => {
        setPickedLocation(null);
        setAmounts([]);

        if (!selectedNumber) return;

        let cancelled = false;
        getPartsAmounts({ warehouse: robot.warehouse, part_number: selectedNumber })
            .then((res) => {
                if (!cancelled) setAmounts(res as IStockAmountItem[]);
            });
        return () => { cancelled = true; };
    }, [selectedNumber, robot.warehouse]);

    useEffect(() => {
        if (pickedLocation?.quantity != null) {
            setQuantity((q) => clampQty(Math.min(q, pickedLocation.quantity)));
        }
    }, [pickedLocation]);


    const filteredParts = useMemo(() => {
        const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
        if (!terms.length) return parts;
        return parts.filter((item) => matchesAllTerms(buildSearchText(item), terms));
    }, [parts, searchQuery]);


    const selectedPart = useMemo(
        () => parts.find((p) => p.material_number === selectedNumber) ?? null,
        [parts, selectedNumber],
    );


    const handleSelect = useCallback((materialNumber: string) => {
        setSelectedNumber((prev) => prev === materialNumber ? null : materialNumber);
        setQuantity(1);
        setDropdownOpen(false);
        setRawSearch("");
    }, []);

    const handleSheetOpen = useCallback(() => {
        setSheetOpen(true);
        setDropdownOpen(true);
        fetchParts();
    }, [fetchParts]);

    const reset = useCallback(() => {
        setSheetOpen(false);
        setDropdownOpen(false);
        setSelectedNumber(null);
        setQuantity(1);
        setPickedLocation(null);
        setRawSearch("");
    }, []);

    const handleSubmit = async () => {
        if (!currentUser)       return;
        if (!selectedNumber)    { toast.error("Please select a part.");           return; }
        if (!pickedLocation)    { toast.error("Please select a stock location."); return; }
        if (quantity < MIN_QTY) { toast.error("Quantity must be at least 1.");    return; }

        if (pickedLocation.quantity != null && quantity > pickedLocation.quantity) {
            toast.error(`Only ${pickedLocation.quantity} units available at ${pickedLocation.location}.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const data = {
                parts_numbers: [selectedNumber],
                card_id:   currentUser.card_id,
                robot_id:  robot.id,
                warehouse: pickedLocation.warehouse,
                location:  pickedLocation.location,
                quantity,
            };

            // Сначала списываем со склада — при ошибке (нет остатка) не добавляем на робота
            await StockService.removePartsFromStock({
                warehouse: pickedLocation.warehouse,
                location:  pickedLocation.location,
                material_number: selectedNumber,
                quantity,
            });

            const result = await addChangeParts({ data });

            if (result) {
                toast.success(
                    `Part added — ${quantity} unit${quantity > 1 ? "s" : ""} from ${pickedLocation.location}.`,
                );
                addPartsHistory(result.robot_id, { ...result, user: currentUser });
                reset();
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    const canSubmit = !isSubmitting && !!selectedNumber && !!pickedLocation;

    return (
        <Sheet open={sheetOpen} onOpenChange={(open) => !open && reset()}>
            <SheetTrigger asChild onClick={handleSheetOpen}>
                <Button variant="outline" size="icon" className="group w-9 h-9">
                    <Wrench className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                    <span className="sr-only">Add part</span>
                </Button>
            </SheetTrigger>

            <SheetContent
                className="flex flex-col w-full md:min-w-[560px] gap-0 p-0"
                onClick={(e) => e.preventDefault()}
            >
                {/* ── Header ─────────────────────────────────────────────────────── */}
                <SheetHeader className="px-6 py-5 border-b border-border/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                            <Wrench className="h-4 w-4" />
                        </div>
                        <div>
                            <SheetTitle className="text-base leading-tight">Add Part</SheetTitle>
                            <SheetDescription className="text-xs mt-0.5">
                                Robot #{robot.robot_number} · {robot.robot_type}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {/* ── Body ───────────────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* Part selector */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Part
                        </Label>

                        <Popover
                            open={dropdownOpen}
                            onOpenChange={(o) => { setDropdownOpen(o); if (!o) setRawSearch(""); }}
                        >
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between gap-2 font-normal h-10">
                                    {selectedPart ? (
                                        <span className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {selectedPart.description_eng ?? selectedPart.description_orginall}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                        {selectedPart.material_number}
                      </span>
                    </span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Select a part…</span>
                                    )}
                                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                className="w-[var(--radix-popover-trigger-width)] p-0 shadow-xl"
                                align="start"
                                sideOffset={6}
                                onOpenAutoFocus={(e) => e.preventDefault()}
                            >
                                <div className="flex flex-col h-[380px]">
                                    {/* Search */}
                                    <div className="px-3 pt-3 pb-2 border-b border-border/30 shrink-0">
                                        <Input
                                            value={rawSearch}
                                            onChange={(e) => setRawSearch(e.target.value)}
                                            placeholder="Search by name or part number…"
                                            className="h-8 text-sm"
                                            autoComplete="off"
                                        />
                                        <p className="text-[10px] text-muted-foreground/50 mt-1.5 px-0.5">
                                            {partsLoading ? "Loading catalogue…" : `${filteredParts.length} / ${parts.length}`}
                                        </p>
                                    </div>

                                    {/* List */}
                                    <div
                                        className="flex-1 overflow-y-auto p-2"
                                        onWheel={(e) => e.stopPropagation()}
                                    >
                                        {partsLoading ? (
                                            <div className="flex items-center justify-center h-full gap-2 text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                                            </div>
                                        ) : filteredParts.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full gap-2 text-sm text-muted-foreground">
                                                <Package className="h-8 w-8 opacity-25" />
                                                {rawSearch ? `No results for "${rawSearch}"` : "No parts available"}
                                            </div>
                                        ) : (
                                            <VirtualList
                                                items={filteredParts}
                                                selectedNumber={selectedNumber}
                                                onSelect={handleSelect}
                                            />
                                        )}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Quantity — only when part is selected */}
                    {selectedNumber && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Quantity
                            </Label>
                            <QuantityInput
                                value={quantity}
                                onChange={setQuantity}
                                max={pickedLocation?.quantity ?? undefined}
                            />
                        </div>
                    )}

                    {/* Location picker — only when part is selected */}
                    {selectedNumber && (
                        <PartsPreview
                            part_number={selectedNumber}
                            amounts={amounts}
                            pickedLocation={pickedLocation}
                            onPickLocation={setPickedLocation}
                        />
                    )}

                    {/* Nudge when location not yet picked */}
                    {selectedNumber && !pickedLocation && (
                        <p className="text-xs text-amber-500/80 flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            Select a stock location to proceed.
                        </p>
                    )}
                </div>

                {/* ── Footer ─────────────────────────────────────────────────────── */}
                <SheetFooter className="flex-row gap-2 px-6 py-4 border-t border-border/50 bg-muted/20 shrink-0">
                    <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1 gap-2">
                        {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Save{canSubmit ? ` — ${quantity} unit${quantity > 1 ? "s" : ""}` : ""}
                            </>
                        )}
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline" onClick={reset}>Cancel</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default PartsPicker;