'use client'
import React, {useEffect, useMemo, useState} from 'react';
import dayjs from "dayjs";
import ChangedParts from "@/components/shared/dashboard/ShiftStats/ChangedParts";
import {useRobotsStore} from "@/store/robotsStore";
import {getWorkDate} from "@/futures/Date/getWorkDate";
import {IRobot} from "@/types/robot/robot";
import { IUser } from "@/types/user/user";



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

const ShiftStats = ({setFixed_robots}: {setFixed_robots: (value: IRobot[]) => void}) => {
    const robots = useRobotsStore(state => state.robots);
    const [date, setDate] = useState<Date | undefined>(getWorkDate(new Date()));

    const onlyThisShift = useMemo(() => {
        if (!robots || !date) return [];

        const selectedDate = dayjs(date);

        const filtered = robots.filter(item  => {
            if (item.parts_history.length === 0) return false;

            const itemDate = dayjs(item.updated_at);

            return itemDate.format("YYYY-MM") === selectedDate.format("YYYY-MM")
        });

        // Сортировка по времени
        return filtered.sort((a, b) =>
            dayjs(a.updated_at).valueOf() - dayjs(b.updated_at).valueOf()
        );
    }, [robots, date]);

    useEffect(() => {
        console.log('Filtered shift data:', onlyThisShift);
        setFixed_robots(onlyThisShift);
    }, [onlyThisShift]);

    const dataExtend = onlyThisShift as unknown as IRobotExtend[];

    if (!robots) {
        return <div className="p-4">Loading stats...</div>;
    }

    return (
        <div className="py-5 mask-b-from-50%">
            <div className="grid grid-cols-1 gap-4 py-2">
                <ChangedParts robots={dataExtend} />
            </div>
        </div>
    );
};

export default ShiftStats;