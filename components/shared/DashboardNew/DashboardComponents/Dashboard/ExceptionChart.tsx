'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from "sonner";
import { useSessionStore } from "@/store/session";
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { ExceptionService } from "@/services/exceptionService";
import dayjs from "dayjs";

const chartConfig = {
    current: {
        label: "Current Month",
        color: "var(--chart-1)",
    },
    prev: {
        label: "Previous Month",
        color: "gray",
    },
} satisfies ChartConfig;

const ExceptionChart: React.FC = () => {
    const session = useSessionStore(state => state.currentSession);
    const [loading, setLoading] = useState(true);

    const [chart_data, setChart_data] = useState<
        { date: string; current: number; prev: number }[]
    >([]);

    const getHistoryData = useCallback(async () => {
        if (!session?.warehouse_sessions?.length) {
            setChart_data([]);
            return;
        }

        setLoading(true);

        try {
            const response = await ExceptionService.getExceptionsChartHistory(
                session.warehouse_sessions
            );

            if (response) {
                const now = dayjs.utc();

                const currentMonth = response.filter(r =>
                    dayjs(r.error_start_time).isSame(now, 'month')
                );

                const prevMonth = response.filter(r =>
                    dayjs(r.error_start_time).isSame(now.subtract(1, 'month'), 'month')
                );

                const groupByDay = (data: typeof response) => {
                    return data.reduce<Record<number, number>>((acc, item) => {
                        const day = dayjs(item.error_start_time).date(); // 1-31
                        acc[day] = (acc[day] || 0) + 1;
                        return acc;
                    }, {});
                };

                const currentGrouped = groupByDay(currentMonth);
                const prevGrouped = groupByDay(prevMonth);

                const merged = Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    return {
                        date: String(day),
                        current: currentGrouped[day] || 0,
                        prev: prevGrouped[day] || 0,
                    };
                });

                setChart_data(merged);
            }

        } catch (error) {
            console.error(error);
            toast.error(String(error));
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(session?.warehouse_sessions)]);

    useEffect(() => {
        getHistoryData();
    }, [getHistoryData]);

    const trend = React.useMemo(() => {
        const filtered = chart_data.filter(d => d.current > 0);

        if (filtered.length < 2) return null;

        const last = filtered[filtered.length - 1].current;
        const prev = filtered[filtered.length - 2].current;

        if (prev === 0) return null;

        const change = ((last - prev) / prev) * 100;

        return {
            value: Math.abs(change).toFixed(1),
            isUp: change >= 0,
        };
    }, [chart_data]);

    return (
        <Card>

            <CardContent>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <ChartContainer className="h-[300px] w-full" config={chartConfig}>
                        <AreaChart data={chart_data} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} />

                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                            />

                            <ChartTooltip
                                cursor={true}
                                content={<ChartTooltipContent indicator="dot" />}
                            />

                            {/* прошлый месяц (фон) */}
                            <Area
                                dataKey="prev"
                                type="step"
                                stroke="gray"
                                strokeDasharray="4 4"
                                fill="gray"
                                fillOpacity={0.1}
                            />

                            {/* текущий месяц */}
                            <Area
                                dataKey="current"
                                type="step"
                                stroke="var(--chart-1)"
                                fill="var(--chart-1)"
                                fillOpacity={0.4}
                            />

                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>

            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">

                        <div className="flex items-center gap-2 leading-none font-medium">
                            {trend ? (
                                <>
                                    {trend.isUp ? "Increasing" : "Decreasing"} by {trend.value}%
                                    <TrendingUp
                                        className={`h-4 w-4 ${
                                            trend.isUp
                                                ? "text-green-500"
                                                : "text-red-500 rotate-180"
                                        }`}
                                    />
                                </>
                            ) : (
                                "No trend data"
                            )}
                        </div>

                        <div className="text-muted-foreground">
                            Current vs previous month (by day)
                        </div>

                    </div>
                </div>
            </CardFooter>

        </Card>
    );
};

export default ExceptionChart;