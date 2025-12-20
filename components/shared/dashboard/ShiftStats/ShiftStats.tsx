'use client'
import React, {useEffect, useMemo, useState} from 'react';
import dayjs from "dayjs";
import ChangedParts from "@/components/shared/dashboard/ShiftStats/ChangedParts";
import {useRobotsStore} from "@/store/robotsStore";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {ChevronDownIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {getWorkDate} from "@/futures/Date/getWorkDate";
import {getInitialShift} from "@/futures/Date/getInitialShift";

const ShiftStats = () => {
    const robots = useRobotsStore(state => state.robots);

    const [open, setOpen] = React.useState(false)

    const [date, setDate] = React.useState<Date | undefined>(getWorkDate(new Date()));
    const [shift_type, setShift_type] = useState<'day' | 'night'>(getInitialShift());

    const onlyThisShift = useMemo(() => {
        if (!robots) return [];

        const selectedDate = dayjs(date);

        const filtered = robots.filter(item => {
            const itemDate = dayjs(item.updated_at);
            const itemHour = itemDate.hour();

            // Дневная смена: 6:00 - 18:00
            if (shift_type === 'day') {
                return itemDate.format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD")
                    && itemHour >= 6
                    && itemHour < 18;
            }
            // Ночная смена: 18:00 - 6:00
            else {
                // Ночная смена может начинаться в выбранный день (18:00-23:59)
                const isCurrentDayNight = itemDate.format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD")
                    && itemHour >= 18;

                // Или заканчиваться на следующий день (00:00-05:59)
                const isNextDayMorning = itemDate.format("YYYY-MM-DD") === selectedDate.add(1, 'day').format("YYYY-MM-DD")
                    && itemHour < 6;

                return isCurrentDayNight || isNextDayMorning;
            }
        });

        // Сортируем по времени (от раннего к позднему)
        return filtered.sort((a, b) => {
            return dayjs(a.updated_at).valueOf() - dayjs(b.updated_at).valueOf();
        });

    }, [robots, date, shift_type]);

    useEffect(() => {
        console.log('Filtered shift data:', onlyThisShift);
    }, [onlyThisShift]);

    if (!robots) {
        return (
            <div className="p-4">Loading stats...</div>
        );
    }

    return (
        <div className={`py-5 mask-b-from-50%`}>
            <div className="flex justify-between gap-3">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date"
                            className="justify-between font-normal"
                        >
                            {date ? date.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                                setDate(date)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
                <Select value={shift_type} onValueChange={(e) => setShift_type(e as 'day' | 'night')}>
                    <SelectTrigger className="">
                        <SelectValue placeholder="Select a shift" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Shift types</SelectLabel>
                            <SelectItem value="day">Day (6:00 - 18:00)</SelectItem>
                            <SelectItem value="night">Night (18:00 - 6:00)</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className={`grid grid-cols-1 gap-4 py-2`}>
                <ChangedParts robots={onlyThisShift}/>
            </div>
        </div>
    );
};

export default ShiftStats;