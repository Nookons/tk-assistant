'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { getAllExceptions } from "@/futures/exception/getAllExceptions";
import { getAllChangedParts } from "@/futures/Parts/getAllChangedParts";
import PieKeyValue from "@/components/charts/Pie/PieKeyValue";



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
            .sort((a, b) => b.value - a.value);
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
            .sort((a, b) => b.value - a.value);
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
            .sort((a, b) => b.value - a.value);
    }, [exceptions]);


    return (
        <div className="relative w-full  flex flex-col md:grid md:grid-cols-3 gap-4 p-2 md:p-8">
            {/* Параллакс фон */}
            <div className="fixed top-0 left-0 w-full h-screen pointer-events-none"
                 style={{
                     backgroundImage: 'url(/img/welcome.png)',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     backgroundRepeat: 'no-repeat',
                     zIndex: -1
                 }}
            />

            {partsChangedData.length > 0 && <PieKeyValue title={`Parts changed (pcs)`} data={partsChangedData} />}
            {SolvingTimeData.length > 0 && <PieKeyValue title={`Exceptions time (m)`} data={SolvingTimeData} />}
            {ExceptionsCounter.length > 0 && <PieKeyValue title={`Exceptions Count (pcs)`} data={ExceptionsCounter} />}
        </div>
    );
}
