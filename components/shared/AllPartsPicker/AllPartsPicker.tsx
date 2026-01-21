import React, {useEffect, useMemo, useState} from 'react';
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Check, ChevronDown, LoaderCircle, Search} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {useStockStore} from "@/store/stock";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {cn} from "@/lib/utils";

interface AllPartsPickerProps {
    onPick: (materialNumber: string) => void;
    selected?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    filterByPartTypes?: string[]; // Опциональная фильтрация по типам
    showCount?: boolean;
}

const AllPartsPicker: React.FC<AllPartsPickerProps> = ({
                                                           onPick,
                                                           selected = "",
                                                           placeholder = "Select a part...",
                                                           disabled = false,
                                                           className,
                                                           filterByPartTypes,
                                                           showCount = true
                                                       }) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const items_templates = useStockStore(state => state.items_templates);

    // Группировка по типам с мемоизацией
    const groupedItems = useMemo(() => {
        if (!items_templates || !Array.isArray(items_templates)) {
            return {};
        }

        const filtered = filterByPartTypes
            ? items_templates.filter(item =>
                item?.part_type && filterByPartTypes.includes(item.part_type)
            )
            : items_templates;

        return filtered.reduce((acc, item) => {
            if (!item?.part_type) return acc;

            if (!acc[item.part_type]) {
                acc[item.part_type] = [];
            }
            acc[item.part_type].push(item);
            return acc;
        }, {} as Record<string, IStockItemTemplate[]>);
    }, [items_templates, filterByPartTypes]);

    // Поиск с мемоизацией
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return groupedItems;

        const query = searchQuery.toLowerCase();
        const result: Record<string, IStockItemTemplate[]> = {};

        Object.entries(groupedItems).forEach(([partType, items]) => {
            const filtered = items.filter(item => {
                const searchableText = [
                    item.material_number,
                    item.description_eng,
                    item.description_orginall,
                    item.part_type
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                return searchableText.includes(query);
            });

            if (filtered.length > 0) {
                result[partType] = filtered;
            }
        });

        return result;
    }, [groupedItems, searchQuery]);

    const totalCount = useMemo(() => {
        return Object.values(groupedItems).reduce((sum, items) => sum + items.length, 0);
    }, [groupedItems]);

    const selectedItem = useMemo(() => {
        if (!selected || !items_templates) return null;
        return items_templates.find(item => item?.material_number === selected);
    }, [selected, items_templates]);

    const handleSelect = (materialNumber: string) => {
        if (!materialNumber) return;
        onPick(materialNumber);
        setOpen(false);
        setSearchQuery("");
    };

    // Загрузка
    if (!items_templates) {
        return (
            <div className="flex items-center justify-center p-4">
                <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const hasResults = Object.keys(filteredGroups).length > 0;
    const displayText = selectedItem
        ? `${selectedItem.material_number} - ${selectedItem.description_eng || selectedItem.description_orginall || ''}`
        : placeholder;

    return (
        <div className={cn("w-full", className)}>
            {showCount && (
                <p className="text-xs text-muted-foreground mb-1.5">
                    Total: {totalCount} part{totalCount !== 1 ? 's' : ''}
                </p>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            "w-full justify-between gap-2 font-normal",
                            !selected && "text-muted-foreground"
                        )}
                    >
            <span className="truncate text-left flex-1 min-w-0">
              {displayText}
            </span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                    sideOffset={4}
                >
                    <Command shouldFilter={false}>
                        <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                                placeholder="Search by name or number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <CommandList className="max-h-[min(400px,60vh)] overflow-y-auto">
                            {!hasResults ? (
                                <CommandEmpty>
                                    {searchQuery ? "No parts found matching your search." : "No parts available."}
                                </CommandEmpty>
                            ) : (
                                Object.entries(filteredGroups)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([partType, items]) => (
                                        <CommandGroup
                                            key={partType}
                                            heading={`${partType} (${items.length})`}
                                        >
                                            {items.map((item) => {
                                                const isSelected = selected === item.material_number;
                                                const displayName = [
                                                    item.description_orginall,
                                                    item.description_eng,
                                                    item.material_number
                                                ]
                                                    .filter(Boolean)
                                                    .join(' - ');

                                                return (
                                                    <CommandItem
                                                        key={item.id || item.material_number}
                                                        value={item.material_number}
                                                        onSelect={() => handleSelect(item.material_number)}
                                                        className="flex items-center justify-between gap-2 cursor-pointer py-3"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="truncate text-sm">
                                                                {displayName}
                                                            </div>
                                                        </div>
                                                        <Check
                                                            className={cn(
                                                                "h-4 w-4 shrink-0 transition-opacity",
                                                                isSelected ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    ))
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default AllPartsPicker;