import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import React from 'react';
import {format} from "date-fns";
import {enUS} from "date-fns/locale";
import {Button} from "@/components/ui/button";
import {ChevronDownIcon} from "lucide-react";

const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2024, i, 1), "LLLL", { locale: enUS })
)

const MonthPicker = ({date, setDate}: {date: Date | null,  setDate: (e: Date) => void}) => {
    const [open, setOpen] = React.useState(false)

    const handleSelectMonth = (monthIndex: number) => {
        const selected = new Date(new Date().getFullYear(), monthIndex, 1)
        setDate(selected)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-between"
                >
                    {date
                        ? format(date, "LLLL yyyy", { locale: enUS })
                        : "Select month"}
                    <ChevronDownIcon />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-2">
                <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => (
                        <Button
                            key={month}
                            variant="ghost"
                            className="capitalize"
                            onClick={() => handleSelectMonth(index)}
                        >
                            {month}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default MonthPicker;