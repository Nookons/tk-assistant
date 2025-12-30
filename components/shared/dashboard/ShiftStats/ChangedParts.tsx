'use client'
import React, {useState} from 'react';
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, } from "@/components/ui/empty";
import {Separator} from "@/components/ui/separator";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Box, Copy, Sheet, Hammer} from "lucide-react";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {toast} from "sonner";
import ShiftStats, {IRobotExtend} from "@/components/shared/dashboard/ShiftStats/ShiftStats";

// Интерфейсы для типизации
interface ILocalItem {
    id: number;
    created_at: string;
    robot_id: number;
    parts_numbers: string; // Это строка, пришедшая из БД
}

interface ILocalData {
    shift: {
        start: string;
        end: string;
        type: string;
    },
    data: ILocalItem[]
}

const ChangedParts = ({robots}: { robots: IRobotExtend[] }) => {
    const [partsStats, setPartsStats] = useState<Record<string, ILocalData>>({});
    const [isCopying, setIsCopying] = useState(false);


    const handleCopy = async () => {
        if (isCopying) return;

        setIsCopying(true);
        try {
            // Собираем все записи из parts_history всех роботов
            const allEntries: Array<{ created_at: string; parts_numbers: string; user_name: string; robot_number: number; }> = [];

            console.log(robots);

            robots.forEach(robot => {
                if (robot?.parts_history && Array.isArray(robot.parts_history)) {
                    robot.parts_history.forEach(entry => {
                        allEntries.push({
                            created_at: entry.created_at,
                            parts_numbers: entry.parts_numbers,
                            user_name: entry.user?.user_name || "Unknown",
                            robot_number: robot.robot_number
                        });
                    });
                }
            });

            if (allEntries.length === 0) {
                toast.warning("No data to copy");
                return;
            }

            // Формируем строки для копирования
            const textToCopy = allEntries
                .flatMap(entry => {
                    try {
                        const partsArray: string[] = JSON.parse(entry.parts_numbers || '[]');

                        return partsArray.map((partNumber: string) => {
                            const date = dayjs(entry.created_at).format("YYYY/MM/DD HH:mm");
                            return `${date}\t${entry.user_name}\tOUT\t${partNumber}\t\t\t1\tGLPC-C\t${entry.robot_number}`;
                        });
                    } catch (parseError) {
                        console.error("Error parsing parts_numbers:", parseError);
                        return [];
                    }
                })
                .filter(line => line)
                .join('\n');

            if (textToCopy) {
                await navigator.clipboard.writeText(textToCopy);
                toast.success("Text copied to clipboard");
            } else {
                toast.warning("No valid data to copy");
            }
        } catch (err) {
            console.error("Error copying:", err);
            toast.error("Failed to copy to clipboard");
        } finally {
            setIsCopying(false);
        }
    };

    if (!robots.length) {
        return (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Box/>
                    </EmptyMedia>
                    <EmptyDescription>
                        No robots found.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }


    return (
        <div className="shadow-sm">
            <div className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        <Button
                            onClick={handleCopy}
                            variant="ghost"
                            className="p-1"
                            disabled={isCopying}
                        >
                            <Copy size={12}/>
                        </Button>
                        <Button variant="ghost" className="p-1">
                            <Sheet size={12}/>
                        </Button>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs sm:text-sm">
                            Recently robots fixed ({robots.length})
                        </div>
                    </div>
                </div>
            </div>
            <Separator/>
            <div className="p-0">
                <ScrollArea className="h-[300px] sm:h-[450px]">
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-4 my-2">
                        {robots.map((robot) => {
                            if (!robot) return null;

                            const robotEntries = partsStats[robot.id]?.data || [];

                            return (
                                <Link href={`/robot/${robot.id}`} key={robot.id}
                                      className="group w-full relative overflow-hidden rounded-lg sm:rounded-xl border bg-background p-3 sm:p-4 transition-all hover:shadow-md">
                                    {/* Заголовок робота */}
                                    <div className="grid grid-cols-[35px_1fr] w-full">
                                        <div className="p-1.5 sm:p-2">
                                            {robot.robot_type === "K50H" ? (
                                                robot.status === "离线 | Offline" ? (
                                                    <Image src="/img/K50H_red.svg" alt="robot_img" width={30}
                                                           height={30}/>
                                                ) : (
                                                    <Image src="/img/K50H_green.svg" alt="robot_img" width={30}
                                                           height={30}/>
                                                )
                                            ) : (
                                                robot.status === "离线 | Offline" ? (
                                                    <Image src="/img/A42T_red.svg" alt="robot_img" width={30}
                                                           height={30}/>
                                                ) : (
                                                    <Image src="/img/A42T_Green.svg" alt="robot_img" width={30}
                                                           height={30}/>
                                                )
                                            )}
                                        </div>
                                        <div className={`flex w-full text-right flex-col justify-end gap-1`}>
                                            <span
                                                className="text-xs text-muted-foreground p-1 leading-none"
                                            >
                                                {dayjs(robot.updated_at).format('HH:mm · MMM D, YYYY')}
                                            </span>
                                            <div className={`flex gap-1 items-center justify-end`}>
                                                <Hammer size={14} />
                                                <span className="text-xs p-1 sm:text-base font-bold leading-none">{robot.robot_number}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Список замен деталей */}
                                    <div className="flex flex-wrap gap-4 items-center">
                                        {robotEntries.map((entry, entryIndex) => {
                                            let partsArray: string[] = [];
                                            try {
                                                partsArray = JSON.parse(entry.parts_numbers || '[]');
                                            } catch (err) {
                                                console.error("Error parsing parts_numbers:", err);
                                            }

                                            // Безопасное получение user_name
                                            const userName = robot.parts_history?.[entryIndex]?.user?.user_name || "Unknown";

                                            return (
                                                <div key={entry.id}
                                                     className="border w-full border-dashed p-2 rounded-2xl">
                                                    <div className="flex flex-wrap gap-2">
                                                        {partsArray.map((item: string, ind: number) => (
                                                            <Button
                                                                variant="link"
                                                                key={`${entry.id}-${ind}`}
                                                                className="p-1"
                                                            >
                                                                {item}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                    <Separator/>
                                                    <span className="text-[12px] sm:text-[12px] text-muted-foreground">
                                                        {userName} recorded at {dayjs(entry.created_at).format("HH:mm")}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default ChangedParts;