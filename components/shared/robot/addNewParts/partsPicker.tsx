"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    memo,
} from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Loader2, Package, Wrench } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { IStockItemTemplate } from "@/types/stock/StockItem";
import { IStockAmountItem } from "@/types/stock/StockAmounts";
import { IRobot } from "@/types/robot/robot";
import { useUserStore } from "@/store/user";
import { useRobotsStore } from "@/store/robotsStore";
import { addChangeParts } from "@/futures/robots/addChangeParts";
import { getPartsAmounts } from "@/futures/stock/getPartsAmounts";
import PartsPreview from "@/components/shared/robot/addNewParts/PartsPreview";

// ─── Constants ────────────────────────────────────────────────────────────────

/** How many items to render per virtual "page" */
const PAGE_SIZE = 30;
const DEBOUNCE_MS = 250;

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildSearchText = (item: IStockItemTemplate): string =>
    `${item.description_orginall ?? ""} ${item.description_eng ?? ""} ${item.material_number ?? ""}`.toLowerCase();

const matchesAllTerms = (text: string, terms: string[]): boolean =>
    terms.every((t) => text.includes(t));

// ─── PartItem (memoized) ──────────────────────────────────────────────────────

interface PartItemProps {
    item: IStockItemTemplate;
    isSelected: boolean;
    onToggle: (n: string) => void;
}

const PartItem = memo<PartItemProps>(({ item, isSelected, onToggle }) => (
    <button
        type="button"
        onClick={() => onToggle(item.material_number)}
        className={`
            w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg
            transition-colors duration-100 border
            ${isSelected
            ? "bg-primary/8 border-primary/25"
            : "border-transparent hover:bg-muted/60"
        }
        `}
    >
        {/* Labels */}
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate leading-snug">
                {item.description_eng ?? item.description_orginall}
            </p>
            <p className="text-xs font-bold text-muted-foreground/70 font-mono truncate mt-0.5">
                {item.material_number}
            </p>
        </div>

        {/* Checkmark */}
        <Check
            className={`h-4 w-4 shrink-0 text-primary transition-all duration-150 ${
                isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
        />
    </button>
));
PartItem.displayName = "PartItem";

// ─── VirtualList ──────────────────────────────────────────────────────────────
// Renders items page by page. Next page loads when the sentinel div enters view.

interface VirtualListProps {
    items: IStockItemTemplate[];
    selectedNumbers: string[];
    onToggle: (n: string) => void;
}

const VirtualList: React.FC<VirtualListProps> = ({ items, selectedNumbers, onToggle }) => {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Reset to first page whenever the filtered list changes
    useEffect(() => setVisibleCount(PAGE_SIZE), [items]);

    // Grow the visible window when the sentinel scrolls into view
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisibleCount((n) => Math.min(n + PAGE_SIZE, items.length));
                }
            },
            { threshold: 0.1 }
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
                    isSelected={selectedNumbers.includes(item.material_number)}
                    onToggle={onToggle}
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

// ─── PartsPicker ──────────────────────────────────────────────────────────────

interface PartsPickerProps {
    robot: IRobot;
}

const PartsPicker: React.FC<PartsPickerProps> = ({ robot }) => {
    // Parts catalogue — fetched lazily on first sheet open
    const [parts, setParts] = useState<IStockItemTemplate[]>([]);
    const [partsLoaded, setPartsLoaded] = useState(false);
    const [partsLoading, setPartsLoading] = useState(false);

    // Selection state
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
    const [selectedAmounts, setSelectedAmounts] = useState<IStockAmountItem[]>([]);
    const [pickedLocation, setPickedLocation] = useState<IStockAmountItem | null>(null);

    // UI state
    const [rawSearch, setRawSearch] = useState("");
    const searchQuery = useDebounce(rawSearch, DEBOUNCE_MS);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = useUserStore((s) => s.currentUser);
    const addPartsHistory = useRobotsStore((s) => s.addPartsHistory);

    // ── Fetch catalogue once on first open ────────────────────────────────────

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

    // ── Fetch stock amounts whenever selection changes ─────────────────────────

    useEffect(() => {
        if (!selectedNumbers.length) {
            setSelectedAmounts([]);
            return;
        }
        let cancelled = false;
        Promise.all(
            selectedNumbers.map((part_number) =>
                getPartsAmounts({ warehouse: robot.warehouse, part_number })
            )
        ).then((results) => {
            if (!cancelled) setSelectedAmounts(results.flat() as IStockAmountItem[]);
        });
        return () => { cancelled = true; };
    }, [selectedNumbers, robot.warehouse]);

    // ── Filtered list (debounced) ─────────────────────────────────────────────

    const filteredParts = useMemo(() => {
        const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
        if (!terms.length) return parts;
        return parts.filter((item) => matchesAllTerms(buildSearchText(item), terms));
    }, [parts, searchQuery]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const togglePart = useCallback((materialNumber: string) => {
        setSelectedNumbers((prev) =>
            prev.includes(materialNumber)
                ? prev.filter((n) => n !== materialNumber)
                : [...prev, materialNumber]
        );
    }, []);

    const handleSheetOpen = useCallback(() => {
        setSheetOpen(true);
        setDropdownOpen(true);
        fetchParts(); // no-op if already loaded
    }, [fetchParts]);

    const handleSheetClose = useCallback(() => {
        setSheetOpen(false);
        setDropdownOpen(false);
        setSelectedNumbers([]);
        setPickedLocation(null);
        setRawSearch("");
    }, []);

    const handleSubmit = async () => {
        if (!currentUser) return;
        if (!selectedNumbers.length) {
            toast.error("Please select at least one part.");
            return;
        }
        setIsSubmitting(true);
        try {
            if (pickedLocation) {
                await fetch("/api/stock/use-part", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        warehouse: pickedLocation.warehouse,
                        location: pickedLocation.location,
                        material_number: pickedLocation.material_number,
                        card_id: currentUser.card_id,
                        value: 1,
                    }),
                });
            }
            const result = await addChangeParts({
                parts: selectedNumbers,
                card_id: currentUser.card_id,
                robot_id: robot.id,
            });
            if (result) {
                toast.success("Part(s) added successfully.");
                addPartsHistory(result.robot_id, { ...result, user: currentUser });
                handleSheetClose();
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Sheet open={sheetOpen} onOpenChange={(open) => !open && handleSheetClose()}>
            <SheetTrigger asChild onClick={handleSheetOpen}>
                <Button variant="outline" size="icon" className="group w-9 h-9">
                    <Wrench className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                    <span className="sr-only">Add parts</span>
                </Button>
            </SheetTrigger>

            <SheetContent
                className="flex flex-col w-full md:min-w-[560px] gap-0 p-0"
                onClick={(e) => e.preventDefault()}
            >
                {/* ── Header */}
                <SheetHeader className="px-6 py-5 border-b border-border/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                            <Wrench className="h-4 w-4" />
                        </div>
                        <div>
                            <SheetTitle className="text-base leading-tight">Add Parts</SheetTitle>
                            <SheetDescription className="text-xs mt-0.5">
                                Robot #{robot.robot_number} · {robot.robot_type}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {/* ── Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Parts catalogue
                        </label>

                        <Popover
                            open={dropdownOpen}
                            onOpenChange={(o) => {
                                setDropdownOpen(o);
                                if (!o) setRawSearch("");
                            }}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-between gap-2 font-normal h-10"
                                >
                                    <span className="truncate text-sm text-left">
                                        {selectedNumbers.length
                                            ? `${selectedNumbers.length} part${selectedNumbers.length > 1 ? "s" : ""} selected`
                                            : "Select parts…"}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {selectedNumbers.length > 0 && (
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                                {selectedNumbers.length}
                                            </Badge>
                                        )}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </div>
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                className="w-[var(--radix-popover-trigger-width)] p-0 shadow-xl"
                                align="start"
                                sideOffset={6}
                                onOpenAutoFocus={(e) => e.preventDefault()}
                            >
                                <div className="flex flex-col h-[380px]">
                                    {/* Search input — plain Input, no Command overhead */}
                                    <div className="px-3 pt-3 pb-2 border-b border-border/30 shrink-0">
                                        <Input
                                            value={rawSearch}
                                            onChange={(e) => setRawSearch(e.target.value)}
                                            placeholder="Search by name or part number…"
                                            className="h-8 text-sm"
                                            autoComplete="off"
                                        />
                                        <p className="text-[10px] text-muted-foreground/50 mt-1.5 px-0.5">
                                            {partsLoading
                                                ? "Loading catalogue…"
                                                : `${filteredParts.length} / ${parts.length}`}
                                        </p>
                                    </div>

                                    {/* Scrollable list */}
                                    <div
                                        className="flex-1 overflow-y-auto p-2"
                                        onWheel={(e) => e.stopPropagation()}
                                    >
                                        {partsLoading ? (
                                            <div className="flex items-center justify-center h-full gap-2 text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Loading…
                                            </div>
                                        ) : filteredParts.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full gap-2 text-sm text-muted-foreground">
                                                <Package className="h-8 w-8 opacity-25" />
                                                {rawSearch ? `No results for "${rawSearch}"` : "No parts available"}
                                            </div>
                                        ) : (
                                            <VirtualList
                                                items={filteredParts}
                                                selectedNumbers={selectedNumbers}
                                                onToggle={togglePart}
                                            />
                                        )}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Parts preview */}
                    <PartsPreview
                        parts_data={selectedNumbers}
                        selected_amounts={selectedAmounts}
                        picked_location={pickedLocation}
                        setPicked_location={setPickedLocation}
                    />
                </div>

                {/* ── Footer */}
                <SheetFooter className="flex-row gap-2 px-6 py-4 border-t border-border/50 bg-muted/20 shrink-0">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedNumbers.length}
                        className="flex-1 gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Save{selectedNumbers.length > 0 ? ` (${selectedNumbers.length})` : ""}
                            </>
                        )}
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline" onClick={handleSheetClose}>
                            Cancel
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default PartsPicker;