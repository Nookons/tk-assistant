import React, { useMemo, useState } from 'react';
import { IRobot } from "@/types/robot/robot";
import { useQuery } from "@tanstack/react-query";
import { getRobotExceptions } from "@/futures/robots/getRobotExceptions";
import { IRobotException } from "@/types/Exception/Exception";
import dayjs from "dayjs";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";

type ErrorDayPoint = {
    date: string;
    count: number;
    titles: string[];
};

export function buildLast7DaysErrors(
    data: IRobotException[]
): ErrorDayPoint[] {
    const today = dayjs().startOf("day");
    const map = new Map<string, ErrorDayPoint>();

    for (let i = 6; i >= 0; i--) {
        const day = today.subtract(i, "day").format("YYYY-MM-DD");
        map.set(day, {
            date: day,
            count: 0,
            titles: []
        });
    }

    data.forEach(item => {
        const day = dayjs(item.error_start_time).format("YYYY-MM-DD");
        const entry = map.get(day);
        if (!entry) return;

        entry.count += 1;
        entry.titles.push(`${item.second_column} - ${item.user.user_name}` || item.first_column);
    });

    return Array.from(map.values());
}

const chartConfig = {
    count: {
        label: "Errors per day",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const RobotGraph = ({ current_Robot }: { current_Robot: IRobot }) => {
    const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

    const { data, isLoading, isError } = useQuery<IRobotException[]>({
        queryKey: ['robot-exceptions', current_Robot.robot_number],
        queryFn: () => getRobotExceptions(current_Robot.robot_number),
        refetchInterval: 5000,
        enabled: !!current_Robot.robot_number
    });

    const chartData = useMemo(() => {
        if (!data) return [];
        return buildLast7DaysErrors(data);
    }, [data]);

    const totalErrors = useMemo(() => {
        return chartData.reduce((sum, day) => sum + day.count, 0);
    }, [chartData]);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <p className="text-destructive">Error loading exceptions</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (totalErrors === 0) {
        return null;
    }

    const chartHeight = chartData.length * 40 + 40;

    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">Robot Exceptions - Last 7 Days</CardTitle>
                <CardDescription className="text-sm">
                    Total errors: {totalErrors}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full" style={{ height: `${chartHeight}px`, aspectRatio: 'auto' }}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, bottom: 5, left: 5 }}
                        onClick={(data) => {
                            if (data && data.activeTooltipIndex !== undefined) {
                                setActiveTooltip(
                                    activeTooltip === data.activeTooltipIndex
                                        ? null
                                        : data.activeTooltipIndex
                                );
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis
                            type="number"
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="date"
                            tickFormatter={(v) => dayjs(v).format("DD/MM")}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                            tick={{ fontSize: 10 }}
                        />
                        <ChartTooltip
                            active={activeTooltip !== null}
                            cursor={true}
                            content={({ active, payload }) => {
                                if (!active || !payload?.[0]) return null;
                                const data = payload[0].payload as ErrorDayPoint;

                                return (
                                    <div className="border-border/50 bg-background rounded-lg border px-3 py-2 shadow-xl min-w-[200px]">
                                        <div className="mb-2">
                                            <div className="font-semibold text-sm">
                                                {dayjs(data.date).format("dddd, MMM D")}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                ({data.count} {data.count === 1 ? 'error' : 'errors'})
                                            </div>
                                        </div>

                                        {data.titles.length > 0 && (
                                            <ScrollArea className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                                                {data.titles.map((error, idx) => (
                                                    <div key={idx} className="text-xs border-l-2 border-primary pl-2 py-1">
                                                        {error}
                                                    </div>
                                                ))}
                                            </ScrollArea>
                                        )}

                                        <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                            Click to close
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="var(--color-count)"
                            className={`cursor-pointer`}
                            radius={[0, 4, 4, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default RobotGraph;