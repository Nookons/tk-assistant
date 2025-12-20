'use client'
import React, { useEffect, useState } from 'react';
import { IRobot } from "@/types/robot/robot";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {ReplaceAll, Clock, Settings2, Box, Copy, Sheet} from "lucide-react";
import dayjs from "dayjs";
import { getPartsStatsByRobot } from "@/futures/robots/getPartsStatsByRobot";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

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

const ChangedParts = ({ robots }: { robots: IRobot[] }) => {
    const [partsStats, setPartsStats] = useState<Record<string, ILocalData>>({});
    const [loading, setLoading] = useState(false);

    const [partsCounter, setPartsCounter] = useState<number>(0)

    useEffect(() => {
        const fetchAllStats = async () => {
            if (!robots || robots.length === 0) return;
            setLoading(true);
            try {
                const promises = robots.map(robot => getPartsStatsByRobot(robot.id.toString()));
                const results = await Promise.all(promises);
                const statsMap: Record<string, ILocalData> = {};
                results.forEach((res, index) => {
                    statsMap[robots[index].id] = res;
                });
                setPartsStats(statsMap);
            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllStats();
    }, [robots]);

    const firstStat = Object.values(partsStats).find(s => s?.shift);
    const shiftInfo = firstStat?.shift;

    useEffect(() => {
        let count = 0;
        Object.values(partsStats).forEach(item => {
            count += item.data.length;
        });
        setPartsCounter(count);
    }, [partsStats]);

    if (!loading && robots.length < 1 || partsCounter === 0) return (
        <Empty className="p-4 sm:p-6 border-dashed border-2">
            <EmptyHeader>
                <EmptyMedia variant="icon"><ReplaceAll /></EmptyMedia>
                <EmptyTitle className="text-sm sm:text-base">No parts changed</EmptyTitle>
            </EmptyHeader>
        </Empty>
    );

    return (
        <div className="shadow-sm">
            <div className="pb-3">
                <div className="flex items-center gap-3">
                    <div className={`flex gap-2`}>
                        <Button variant={`ghost`} className={`p-1`}><Copy size={12} /></Button>
                        <Button variant={`ghost`} className={`p-1`}><Sheet  size={12} /></Button>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs sm:text-sm">Recently replaced components ({partsCounter})</div>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="p-0">
                <ScrollArea className="h-[300px] sm:h-[450px]">
                    <div className="py-2 space-y-3 sm:space-y-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-2 p-3 border rounded-lg">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            ))
                        ) : (
                            robots.map((robot) => {
                                const robotEntries = partsStats[robot.id]?.data || [];
                                if (robotEntries.length === 0) return null;

                                return (
                                    <div key={robot.id} className="group relative overflow-hidden rounded-lg sm:rounded-xl border bg-background p-3 sm:p-4 transition-all hover:shadow-md">
                                        {/* Заголовок робота */}
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-1.5 sm:p-2">
                                                    {robot.robot_type === "K50H"
                                                        ?
                                                        <>
                                                            {robot.status === "离线 | Offline"
                                                                ? <Image src={`/img/K50H_red.svg`} alt={`robot_img`} width={30} height={30} />
                                                                : <Image src={`/img/K50H_green.svg`} alt={`robot_img`} width={30} height={30} />
                                                            }
                                                        </>
                                                        :
                                                        <>
                                                            {robot.status === "离线 | Offline"
                                                                ? <Image src={`/img/A42T_red.svg`} alt={`robot_img`} width={30} height={30} />
                                                                : <Image src={`/img/A42T_Green.svg`} alt={`robot_img`} width={30} height={30} />
                                                            }
                                                        </>
                                                    }
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/robot/${robot.id}`}
                                                        className="text-xs p-1 sm:text-sm font-bold leading-none"
                                                    >
                                                        {robot.robot_number}
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground bg-muted/50 px-1.5 sm:px-2 py-1 rounded-md">
                                                <Clock size={11} className="sm:w-3 sm:h-3" />
                                                <span className="text-[12px] sm:text-[12px] font-medium">
                                                    {dayjs(robot.updated_at).format("HH:mm")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Список замен деталей */}
                                        <div className="flex flex-wrap gap-4 items-center ">
                                            {robotEntries.map((entry) => {
                                                const partsArray = JSON.parse(entry.parts_numbers) || [];


                                                return (
                                                    <div key={entry.id} className="border w-full border-dashed p-2 rounded-2xl">
                                                        <div className="flex flex-wrap gap-2">
                                                            {partsArray.map((item: string, ind: number) => (
                                                                <>
                                                                    <Button
                                                                        variant={`link`}
                                                                        key={ind}
                                                                        className="p-1"
                                                                    >
                                                                        {item}
                                                                    </Button>
                                                                </>
                                                            ))}
                                                        </div>
                                                        <Separator className="" />
                                                        <span className="text-[12px] sm:text-[12px] text-muted-foreground">
                                                            Recorded at {dayjs(entry.created_at).format("HH:mm")}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default ChangedParts;