import React, {FC, useEffect, useState} from 'react';
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Check, ChevronDown, LoaderCircle} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {useStockStore} from "@/store/stock";
import {IStockItemTemplate} from "@/types/stock/StockItem";


interface IProps {
    selected: string,
    setSelected: (value: string) => void
}

const AllPartsPicker: React.FC<IProps> = ({selected, setSelected}) => {
    const [open, setOpen] = useState(false)
    const items_templates = useStockStore(state => state.items_templates)

    const [k50h, setK50h] = useState<IStockItemTemplate[]>([])
    const [A42T, setA42T] = useState<IStockItemTemplate[]>([])

    useEffect(() => {
        if (items_templates) {
            const k50h_res = items_templates.filter(item => item.part_type === 'K50H')
            const a42t_res = items_templates.filter(item => item.part_type === 'A42T')

            setK50h(k50h_res);
            setA42T(a42t_res);
        }
    }, [items_templates]);

    if (!items_templates) return (
        <div className={`max-w-[800px] m-auto px-4 py-4`}>
            <LoaderCircle className={`animate-spin w-full`} />
        </div>
    )

    return (
        <div>
            <p className={`text-xs text-muted-foreground mb-1`}>Total: {items_templates.length}</p>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className="w-full border p-2 rounded-md flex justify-between items-center gap-2 min-w-0"
                    >
                                    <span className="truncate text-left flex-1 min-w-0">
                                        {selected ? selected : "Parts for this robot."}
                                    </span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                    sideOffset={5}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <Command className="rounded-lg border shadow-md">
                        <CommandInput
                            placeholder="Type a problem or select..."
                            className="h-9 text-base"
                        />
                        <CommandList
                            className="max-h-[400px] overflow-y-auto"
                            onWheel={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="K50H">
                                {k50h.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        onSelect={() => setSelected(item.material_number)}
                                        className="flex items-center justify-between gap-2 cursor-pointer"
                                    >
                                                    <span className="flex-1 truncate min-w-0">
                                                        {item.description_orginall} - {item.description_eng} - {item.material_number}
                                                    </span>
                                        <Check
                                            className={`h-4 w-4 shrink-0 transition-opacity ${
                                                selected.includes(item.material_number)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            }`}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandGroup heading="A42T">
                                {A42T.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        onSelect={() => setSelected(item.material_number)}
                                        className="flex items-center justify-between gap-2 cursor-pointer"
                                    >
                                                    <span className="flex-1 truncate min-w-0">
                                                        {item.description_orginall} - {item.description_eng} - {item.material_number}
                                                    </span>
                                        <Check
                                            className={`h-4 w-4 shrink-0 transition-opacity ${
                                                selected.includes(item.material_number)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            }`}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default AllPartsPicker;