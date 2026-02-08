'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { getAllExceptions } from "@/futures/exception/getAllExceptions";
import { getAllChangedParts } from "@/futures/Parts/getAllChangedParts";
import PieKeyValue from "@/components/charts/Pie/PieKeyValue";
import RadarKeyValue from "@/components/charts/Radar/RadarKeyValue";
import {Skeleton} from "@/components/ui/skeleton";



export default function Home() {
    const { data: exceptions } = useQuery({
        queryKey: ['home-exceptions'],
        queryFn: () => getAllExceptions(),
        retry: 3,
    });

    const { data: partsData } = useQuery({
        queryKey: ['changed-parts'],
        queryFn: () => getAllChangedParts(),
        retry: 3,
    });

    const partsChangedData = useMemo(() => {
        if (!partsData) return [];

        const statsMap: Record<string, { value: number }> = {};

        partsData.forEach(part => {
            const key = part.user?.user_name ?? "Unknown";

            if (!statsMap[key]) {
                statsMap[key] = { value: 0 };
            }

            statsMap[key].value += 1;
        });

        return Object.entries(statsMap)
            .map(([key, stats]) => ({
                key,
                value: stats.value
            }))
            /*.sort((a, b) => b.value - a.value);*/
    }, [partsData]);

    const SolvingTimeData = useMemo(() => {
        if (!exceptions) return [];

        const statsMap: Record<string, { value: number }> = {};

        exceptions.forEach(part => {
            const key = part.employee ?? "Unknown";

            if (!statsMap[key]) {
                statsMap[key] = { value: part.solving_time };
            }

            statsMap[key].value += part.solving_time;
        });

        return Object.entries(statsMap)
            .map(([key, stats]) => ({
                key,
                value: stats.value
            }))
            /*.sort((a, b) => b.value - a.value);*/
    }, [exceptions]);

    const ExceptionsCounter = useMemo(() => {
        if (!exceptions) return [];

        const statsMap: Record<string, { value: number }> = {};

        exceptions.forEach(part => {
            const key = part.employee ?? "Unknown";

            if (!statsMap[key]) {
                statsMap[key] = { value: 1 };
            }

            statsMap[key].value += 1;
        });

        return Object.entries(statsMap)
            .map(([key, stats]) => ({
                key,
                value: stats.value
            }))
            /*.sort((a, b) => b.value - a.value);*/
    }, [exceptions]);


    return (
        <div className="relative w-full  flex flex-col md:grid md:grid-cols-3 gap-4 p-2 md:p-8">

            {partsChangedData.length < 1 &&
                <Skeleton className={`w-full h-screen`} />
            }


            {partsChangedData.length > 0 && <RadarKeyValue title={`Exceptions time (m)`} data={SolvingTimeData}  />}
            {partsChangedData.length > 0 && <RadarKeyValue title={`Exceptions Count (pcs)`} data={ExceptionsCounter}  />}
            {partsChangedData.length > 0 && <RadarKeyValue title={`Parts changed (pcs)`} data={partsChangedData}  />}
        </div>
    );
}
