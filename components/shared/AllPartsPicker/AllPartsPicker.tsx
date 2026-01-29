'use client'

import React, {useMemo, useState} from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import {Button} from "@/components/ui/button"
import {Check, ChevronDown, LoaderCircle} from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {useStockStore} from "@/store/stock"
import {IStockItemTemplate} from "@/types/stock/StockItem"
import CreateNewStockTemplate from "../Stock/CreateNewStockTemplate"

interface IProps {
    selected: string
    setSelected: (value: string) => void
}

const normalize = (v?: string) =>
    v?.toString().trim().toUpperCase() ?? ""

const AllPartsPicker: React.FC<IProps> = ({selected, setSelected}) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")

    const items = useStockStore(state => state.items_templates)

    const filtered = useMemo(() => {
        if (!items) return []
        if (!search) return items

        const q = normalize(search)

        return items.filter(i =>
            normalize(i.material_number).includes(q) ||
            normalize(i.description_eng).includes(q) ||
            normalize(i.description_orginall).includes(q)
        )
    }, [items, search])

    const handleSelect = (value: string) => {
        setSelected(value)
        setOpen(false)
        setSearch("")
    }

    if (!items) {
        return (
            <div className="flex justify-center py-4">
                <LoaderCircle className="animate-spin" />
            </div>
        )
    }

    return (
        <div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full h-8 text-base justify-between"
                    >
                        <span className="truncate">
                            {selected || "Select material"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                    sideOffset={6}
                    onOpenAutoFocus={e => e.preventDefault()}
                >
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search by number or description"
                            value={search}
                            onValueChange={setSearch}
                            className="h-14 text-base"
                            autoCorrect="off"
                        />

                        <CommandList className="max-h-[35vh] overflow-y-auto overscroll-contain">
                            <CommandEmpty>
                                <div className={`flex justify-center items-center`}>
                                    <CreateNewStockTemplate />
                                </div>
                            </CommandEmpty>

                            <CommandGroup>
                                {filtered.map(item => (
                                    <CommandItem
                                        key={item.id}
                                        onSelect={() => handleSelect(item.material_number)}
                                        className="py-1 rounded-none"
                                    >
                                        <div className="flex flex-col max-w-full gap-0.5">
                                            <span className="font-mono text-sm">
                                                {item.material_number}
                                            </span>
                                            <p className="text-xs line-clamp-1 text-muted-foreground truncate">
                                                {item.description_eng} - {item.description_orginall}
                                            </p>
                                        </div>

                                        <Check
                                            className={`ml-auto h-4 w-4 ${
                                                normalize(selected) === normalize(item.material_number)
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            }`}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-2">
                Pick you material from the list.
            </p>
        </div>
    )
}

export default AllPartsPicker
