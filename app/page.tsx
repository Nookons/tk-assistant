'use client';

import { useEffect, useMemo, useState } from 'react';
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { getAllExceptions } from "@/futures/exception/getAllExceptions";
import { getAllChangedParts } from "@/futures/Parts/getAllChangedParts";

// Форматирование больших чисел
const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
    return num.toString();
};

const chartConfig = {
    desktop: { label: "Desktop", color: "var(--chart-2)" },
    total_time: { label: "Mobile", color: "var(--chart-2)" },
    label: { color: "var(--background)" },
} satisfies ChartConfig;

interface EmployeeStats {
    totalErrors: number;
    totalSolvingTime: number;
    parts?: number;
}

interface ChartData {
    employee: string;
    desktop: number;
    totalTime: number;
    parts?: number;
}

export default function Home() {
    const [scrollY, setScrollY] = useState(0);

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

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Динамическое создание данных для графика
    const chartData: ChartData[] = useMemo(() => {
        if (!exceptions && !partsData) return [];

        const statsMap: Record<string, EmployeeStats> = {};

        exceptions?.forEach(error => {
            const employee = error.employee || "Unknown";

            if (!statsMap[employee]) statsMap[employee] = { totalErrors: 0, totalSolvingTime: error.solving_time || 0 };

            statsMap[employee].totalErrors += 1;
            statsMap[employee].totalSolvingTime += Number(error.solving_time || 0);
        });

        partsData?.forEach(part => {
            const employee = part.user.user_name || "Unknown";

            if (!statsMap[employee]) statsMap[employee] = { totalErrors: 1, totalSolvingTime: 1, parts: 1 };

            statsMap[employee].parts = (statsMap[employee].parts || 0) + 1;
        });

        return Object.entries(statsMap)
            .map(([employee, stats]) => ({
                employee,
                desktop: stats.totalErrors,
                totalTime: stats.totalSolvingTime,
                parts: stats.parts || 0,
            }))
            .sort((a, b) => b.totalTime - a.totalTime);
    }, [exceptions, partsData]);

    if (!chartData.length) return null;

    const barHeight = 50; // Высота одного бара
    const getChartHeight = (dataLength: number) => dataLength * barHeight + 50; // +50 для отступов и осей

    const renderLabelList = (dataKey: keyof ChartData, isValue = false) => (
        <LabelList
            dataKey={dataKey}
            position={isValue ? 'right' : 'insideLeft'}
            offset={isValue ? 10 : 8}
            style={{ fill: 'currentColor', fontWeight: 'bold', whiteSpace: 'nowrap' }}
            fontSize={isValue ? 14 : 12}
            formatter={formatNumber}
        />
    );

    const renderBarChart = (dataKey: keyof ChartData, color: string, title: string, topN = 5) => {
        const chartSlice = topN ? chartData.slice(0, topN) : chartData;
        const chartHeight = getChartHeight(chartSlice.length);

        return (
            <div
                className="w-full md:w-[700px] bg-background/75 rounded-2xl p-4 flex flex-col gap-2"
                style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.1)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)'}}
            >
                <Label className="text-lg font-semibold">{title}</Label>
                <hr className="border-border/50" />
                <ChartContainer config={chartConfig} className="w-full" style={{ minHeight: chartHeight }}>
                    <BarChart
                        data={chartSlice}
                        layout="vertical"
                        margin={{ right: 40, left: 16 }}
                        height={chartHeight}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="employee"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            width={160}
                            tick={({ x, y, payload }) => (
                                <text
                                    x={x}
                                    y={y}
                                    dy={4}
                                    textAnchor="end"
                                    style={{ fill: 'var(--foreground)' }}
                                    fontSize={16}
                                >
                                    {payload.value.length > 18 ? payload.value.slice(0, 15) + '…' : payload.value}
                                </text>
                            )}
                        />
                        <XAxis dataKey={dataKey} type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                indicator="line"
                                formatter={(value, _, props) => (
                                    <div className="flex flex-col gap-1">
                                        <div className="font-semibold">{props.payload.employee}</div>
                                        <div>{dataKey === 'desktop' ? 'Errors' : dataKey === 'totalTime' ? 'Time' : 'Parts'}: {formatNumber(Number(value))}</div>
                                    </div>
                                )}
                            />}
                        />
                        <Bar dataKey={dataKey} fill={color} radius={4}>
                            {renderLabelList(dataKey, true)}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </div>
        );
    };

    return (
        <div className="relative w-full min-h-screen flex flex-col md:grid md:grid-cols-3 gap-4 p-2 md:p-8">
            {/* Параллакс фон */}
            <div className="fixed top-0 left-0 w-full h-screen pointer-events-none"
                 style={{
                     backgroundImage: 'url(/img/welcome.png)',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     backgroundRepeat: 'no-repeat',
                     transform: `translateY(${scrollY * 0.5}px)`,
                     zIndex: -1
                 }}
            />
            {/* Графики */}
            <div className={`max-w-full`}>
                {renderBarChart('parts', 'var(--chart-2)', 'Parts Replaced', 99)}
            </div>
            <div>
                {renderBarChart('totalTime', 'var(--chart-2)', 'Solving Time')}
            </div>
            <div>
                {renderBarChart('desktop', 'var(--chart-2)', 'Exceptions')}
            </div>
        </div>
    );
}
