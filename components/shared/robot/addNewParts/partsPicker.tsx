import React, {useEffect, useState} from 'react';
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
import {Check, ChevronDown, Frown, Laugh, Loader, Settings, Wrench} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {IRobot} from "@/types/robot/robot";
import {useUserStore} from "@/store/user";
import {addChangeParts} from "@/futures/robots/addChangeParts";
import {useRobotsStore} from "@/store/robotsStore";
import {toast} from "sonner";
import PartsPreview from "@/components/shared/robot/addNewParts/PartsPreview";

const PartsPicker = ({robot}: {robot: IRobot}) => {
    const [options_Data, setOptions_Data] = useState<IStockItemTemplate[]>([])
    const [open, setOpen] = useState(false)

    const [sheetOpen, setSheetOpen] = useState<boolean>(false)

    const [selected, setSelected] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const user_store = useUserStore(state => state.current_user)
    const update_parts = useRobotsStore(state => state.addPartsHistory)

    const toggleValue = (value: string) => {
        setSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        )
    }

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
                console.log(response);
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
                toast.error("请至少选择一个部件。 | Please select at least one part.");
                return;
            }

            setIsLoading(true);

            const parts_res = await addChangeParts({
                parts: selected,
                card_id: user_store.card_id,
                robot_id: robot.id,
            })

            if (parts_res) {
                toast.success(`部件添加成功。 | Part(s) added successfully.`)
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

    return (
        <Sheet onOpenChange={() => setSheetOpen(!sheetOpen)} open={sheetOpen}>
            <SheetTrigger onClick={handleSheetOpen} asChild>
                <Button
                    variant="outline"
                    className="group w-full relative flex items-center gap-2"
                >
                    {/* Блок с иконками */}
                    <div className="relative w-5 h-5">
                        {/* Иконка №1 */}
                        <Settings
                            className="
        absolute inset-0
        transition-all duration-300
        group-hover:opacity-0 group-hover:scale-75
      "
                        />

                        {/* Иконка №2 */}
                        <Wrench
                            className="
        absolute inset-0 opacity-0 scale-75
        transition-all duration-300
        group-hover:opacity-100 group-hover:scale-100
      "
                        />
                    </div>

                    {/* Нормально видимый текст */}
                    <span>Add New Part</span>
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
                                        <CommandGroup heading="Hai Box Modules">
                                            {options_Data.map((item) => (
                                                <CommandItem
                                                    key={item.id}
                                                    onSelect={() => toggleValue(item.material_number)}
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

                        <PartsPreview parts_data={selected} />

                    </div>
                </div>
                <SheetFooter>
                    <Button disabled={isLoading} onClick={handleSubmit} type="submit">{isLoading && <Loader className={`animate-spin`} />} Save changes</Button>
                    <SheetClose asChild>
                        <Button onClick={() => setSheetOpen(false)} variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default PartsPicker;