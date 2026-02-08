import React, {useEffect, useState, useMemo} from 'react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Check, ChevronDown, Loader, Settings, Wrench, Package} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {IRobot} from "@/types/robot/robot";
import {useUserStore} from "@/store/user";
import {addChangeParts} from "@/futures/robots/addChangeParts";
import {useRobotsStore} from "@/store/robotsStore";
import {toast} from "sonner";
import PartsPreview from "@/components/shared/robot/addNewParts/PartsPreview";
import {getPartsAmounts} from "@/futures/stock/getPartsAmounts";
import {IStockAmountItem} from "@/types/stock/StockAmounts";

const PartsPicker = ({robot}: {robot: IRobot}) => {
    const [options_Data, setOptions_Data] = useState<IStockItemTemplate[]>([])
    const [open, setOpen] = useState(false)
    const [sheetOpen, setSheetOpen] = useState<boolean>(false)
    const [selected, setSelected] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [picked_location, setPicked_location] = useState<IStockAmountItem | null>(null)
    const [searchQuery, setSearchQuery] = useState<string>("")

    const user_store = useUserStore(state => state.currentUser)
    const update_parts = useRobotsStore(state => state.addPartsHistory)

    const [selected_amounts, setSelected_amounts] = useState<IStockAmountItem[]>([])

    const toggleValue = (value: string) => {
        setSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        )
    }

    // Улучшенная функция поиска с поддержкой множественных критериев
    const filteredParts = useMemo(() => {
        if (!searchQuery.trim()) {
            return options_Data;
        }

        const query = searchQuery.toLowerCase().trim();

        // Разбиваем запрос на отдельные слова для более гибкого поиска
        const searchTerms = query.split(/\s+/).filter(term => term.length > 0);

        return options_Data.filter(item => {
            // Создаем строку из всех полей для поиска
            const searchableText = [
                item.description_orginall || '',
                item.description_eng || '',
                item.material_number || ''
            ].join(' ').toLowerCase();

            // Проверяем, содержатся ли все поисковые термины в тексте
            // Это позволяет искать по частям слов в любом порядке
            return searchTerms.every(term => searchableText.includes(term));
        });
    }, [options_Data, searchQuery]);

    const getPartAmount = async () => {
        try {
            if (selected.length === 0) return;

            const responses = await Promise.all(
                selected.map(item => {
                    const warehouse = robot.warehouse;
                    const part_number = item;

                    return getPartsAmounts({warehouse, part_number})
                })
            );

            setSelected_amounts(responses.flat() as IStockAmountItem[]);
        } catch (error) {
            toast.error("Error getting part amount.");
            console.error(error);
        }
    }

    useEffect(() => {
        getPartAmount()
    }, [selected]);

    const getOptions = async () => {
        try {
            const res = await fetch(`/api/stock/get-robot-parts?robot_type=${robot.robot_type}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            const response = await res.json()

            if (res.ok) {
                setOptions_Data(response)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleSubmit = async () => {
        try {
            if (!user_store) return;

            if (selected.length === 0) {
                toast.error("Please select at least one part.");
                return;
            }

            setIsLoading(true);

            if (picked_location) {
                await fetch(`/api/stock/use-part`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        warehouse: picked_location.warehouse,
                        location: picked_location.location,
                        material_number: picked_location.material_number,
                        card_id: user_store.card_id,
                        value: 1,
                    })
                })
            }

            const parts_res = await addChangeParts({
                parts: selected,
                card_id: user_store.card_id,
                robot_id: robot.id,
            })

            if (parts_res) {
                toast.success(`Part(s) added successfully.`)
                setSelected([])
                update_parts(parts_res.robot_id, {...parts_res, user: user_store})
                setSheetOpen(false)
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSheetOpen = () => {
        setOpen(true)
        setSheetOpen(true)
    }

    useEffect(() => {
        if (robot) {
            getOptions()
        }
    }, [robot]);

    // Сброс поиска при закрытии попапа
    useEffect(() => {
        if (!open) {
            setSearchQuery("");
        }
    }, [open]);

    return (
        <Sheet onOpenChange={() => setSheetOpen(!sheetOpen)} open={sheetOpen}>
            <SheetTrigger onClick={handleSheetOpen} asChild>
                <Button
                    variant="outline"
                    className="group w-full relative flex items-center gap-2"
                >
                    <div className="relative w-5 h-5">
                        <Settings
                            className="
                                absolute inset-0
                                transition-all duration-300
                                group-hover:opacity-0 group-hover:scale-75
                              "
                        />
                        <Wrench
                            className="
                                absolute inset-0 opacity-0 scale-75
                                transition-all duration-300
                                group-hover:opacity-100 group-hover:scale-100
                              "
                        />
                    </div>
                </Button>
            </SheetTrigger>
            <SheetContent onClick={(e) => e.preventDefault()} className={`w-full md:min-w-[550px]`}>
                <SheetHeader>
                    <SheetTitle>Add new part(s) for robot</SheetTitle>
                    <SheetDescription>
                        Make changes to robot here. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid gap-3 w-full">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className="w-full border p-2 rounded-md flex justify-between items-center gap-2 min-w-0"
                                >
                                    <span className="truncate text-left flex-1 min-w-0">
                                        {selected.length ? selected.join(", ") : "Parts for this robot."}
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
                                <Command className="rounded-lg border shadow-md" shouldFilter={false}>
                                    <CommandInput
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                        placeholder="Search by name or number..."
                                        className="h-9 text-base"
                                    />
                                    <CommandList
                                        className="max-h-[300px] overflow-y-auto"
                                        onWheel={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <CommandEmpty>
                                            {searchQuery ? "No parts found matching your search." : "No parts available."}
                                        </CommandEmpty>
                                        <CommandGroup heading={`Hai Box Modules (${filteredParts.length})`}>
                                            {filteredParts.map((item) => (
                                                <CommandItem
                                                    key={item.id}
                                                    value={item.material_number}
                                                    onSelect={() => toggleValue(item.material_number)}
                                                    className="flex items-center gap-3 cursor-pointer py-3"
                                                >
                                                    {/* Изображение детали */}
                                                    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                                                        {item.avatar_url ? (
                                                            <img
                                                                src={item.avatar_url}
                                                                alt={item.description_eng || 'Part image'}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Fallback на иконку при ошибке загрузки
                                                                    e.currentTarget.style.display = 'none';
                                                                    const parent = e.currentTarget.parentElement;
                                                                    if (parent) {
                                                                        parent.innerHTML = '<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-muted-foreground" />
                                                        )}
                                                    </div>

                                                    {/* Информация о детали */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">
                                                                    {item.description_eng || item.description_orginall}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {item.description_orginall && item.description_eng !== item.description_orginall
                                                                        ? item.description_orginall
                                                                        : item.material_number
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                                                    {item.material_number}
                                                                </p>
                                                            </div>

                                                            {/* Чекбокс */}
                                                            <Check
                                                                className={`h-4 w-4 shrink-0 transition-all ${
                                                                    selected.includes(item.material_number)
                                                                        ? "opacity-100 scale-100"
                                                                        : "opacity-0 scale-75"
                                                                }`}
                                                            />
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <PartsPreview
                            picked_location={picked_location}
                            setPicked_location={setPicked_location}
                            selected_amounts={selected_amounts}
                            parts_data={selected}
                        />

                    </div>
                </div>
                <SheetFooter>
                    <Button disabled={isLoading} onClick={handleSubmit} type="submit">
                        {isLoading && <Loader className={`animate-spin mr-2`} />}
                        Save changes
                    </Button>
                    <SheetClose asChild>
                        <Button onClick={() => setSheetOpen(false)} variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default PartsPicker;