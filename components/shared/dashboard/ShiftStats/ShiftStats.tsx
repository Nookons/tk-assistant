'use client'
import React, {useEffect, useMemo, useState} from 'react';
import dayjs from "dayjs";
import ChangedParts from "@/components/shared/dashboard/ShiftStats/ChangedParts";
import {useRobotsStore} from "@/store/robotsStore";
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

// Интерфейс пользователя
interface IUser {
    email: string | null;
    phone: number | null;
    card_id: number;
    position: string;
    user_name: string;
    warehouse: string;
}

// Интерфейс робота (вложенный в parts_history)
interface IRobotNested {
    id: number;
    add_by: number;
    status: string;
    created_at: string;
    robot_type: string;
    updated_at: string;
    updated_by: number;
    problem_note: string;
    robot_number: number;
    type_problem: string;
    inspection_date: string | null;
}

// Интерфейс записи истории замены деталей
interface IPartsHistory {
    id: number;
    user: IUser;
    robot: IRobotNested;
    card_id: number;
    robot_id: number;
    created_at: string;
    parts_numbers: string;
}

// Интерфейс истории статусов
interface IStatusHistory {
    id: number;
    user: IUser;
    add_by: number;
    robot_id: number;
    created_at: string;
    new_status: string;
    old_status: string;
    robot_number: number;
}

// Основной интерфейс робота
interface IRobotExtend {
    id: number;
    created_at: string;
    updated_at: string;
    add_by: IUser;
    robot_number: number;
    robot_type: string;
    type_problem: string;
    problem_note: string;
    status: string;
    updated_by: IUser;
    inspection_date: string | null;
    status_history: IStatusHistory[];
    parts_history: IPartsHistory[];
}

export type {
    IUser,
    IRobotNested,
    IPartsHistory,
    IStatusHistory,
    IRobotExtend
};

const ShiftStats = () => {
    const robots = useRobotsStore(state => state.robots);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(getWorkDate(new Date()));
    const [shift_type, setShift_type] = useState<'day' | 'night'>(getInitialShift());

    // Фильтрация роботов по смене
    const onlyThisShift = useMemo(() => {
        if (!robots || !date) return [];

        const selectedDate = dayjs(date);

        const filtered = robots.filter(item  => {
            if (item.parts_history.length === 0) return false;

            const itemDate = dayjs(item.updated_at);
            const itemHour = itemDate.hour();

            if (shift_type === 'day') {
                // Дневная смена: 6:00 - 18:00
                return itemDate.format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD")
                    && itemHour >= 6
                    && itemHour < 18;
            } else {
                // Ночная смена: 18:00 - 6:00
                const isCurrentDayNight = itemDate.format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD")
                    && itemHour >= 18;

                const isNextDayMorning = itemDate.format("YYYY-MM-DD") === selectedDate.add(1, 'day').format("YYYY-MM-DD")
                    && itemHour < 6;

                return isCurrentDayNight || isNextDayMorning;
            }
        });

        // Сортировка по времени
        return filtered.sort((a, b) =>
            dayjs(a.updated_at).valueOf() - dayjs(b.updated_at).valueOf()
        );
    }, [robots, date, shift_type]);

    useEffect(() => {
        console.log('Filtered shift data:', onlyThisShift);
    }, [onlyThisShift]);

    const dataExtend = onlyThisShift as unknown as IRobotExtend[];

    if (!robots) {
        return <div className="p-4">Loading stats...</div>;
    }

    return (
        <div className="py-5">
            <div className="flex justify-between gap-3">
                {/* Выбор даты */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="justify-between font-normal"
                        >
                            {date ? date.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={(newDate) => {
                                setDate(newDate);
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>

                {/* Выбор смены */}
                <Select
                    value={shift_type}
                    onValueChange={(value) => setShift_type(value as 'day' | 'night')}
                >
                    <SelectTrigger>
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

            {/* Список роботов */}
            <div className="grid grid-cols-1 gap-4 py-2 backdrop-blur-xl p-2">
                <ChangedParts robots={dataExtend} />
            </div>
        </div>
    );
};

export default ShiftStats;