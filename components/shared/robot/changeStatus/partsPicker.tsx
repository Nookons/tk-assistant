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
import {Check, ChevronDown, Settings} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {IRobotApiResponse} from "@/types/robot/robot";
import {changeRobotStatus} from "@/futures/robots/changeRobotStatus";
import {useUserStore} from "@/store/user";

const PartsPicker = ({robot}: {robot: IRobotApiResponse}) => {
    const [options_Data, setOptions_Data] = useState<IStockItemTemplate[]>([])

    const [open, setOpen] = useState(false)

    const [selected, setSelected] = useState<string[]>([])
    const [current_status, setCurrent_status] = useState<string>("")

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const user_store = useUserStore(state => state.current_user)


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

            setIsLoading(true);

            const data = {
                card_id: user_store.card_id,
                new_status: current_status,
                id: robot.id,
            }

            await changeRobotStatus({data})
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (robot) {
            getOptions()
        }
    }, [robot]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="group" variant="outline">
                    <Settings className="transition-transform group-hover:animate-spin" />
                    Change Status
                </Button>
            </SheetTrigger>
            <SheetContent className={`w-full`}>
                <SheetHeader>
                    <SheetTitle>Edit Robot Status</SheetTitle>
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
                                        className="h-9"
                                    />
                                    <CommandList
                                        className="max-h-[200px] overflow-y-auto"
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
                                    {item.description_orginall}-{item.description_eng}
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
                    <div className="grid gap-3">
                        <Select value={current_status} onValueChange={(e) => setCurrent_status(e)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Current Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="waiting_check">Waiting for check</SelectItem>
                                <SelectItem value="waiting_parts">Waiting for parts</SelectItem>
                                <SelectItem value="fixed">Fixed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <SheetFooter>
                    <Button onClick={handleSubmit} type="submit">Save changes</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default PartsPicker;