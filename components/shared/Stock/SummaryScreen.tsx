'use client'
import React, {useEffect, useMemo, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import {getStockSummary} from "@/futures/stock/getStockSummary";
import { TrendingUp } from "lucide-react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Line,
    LineChart,
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    XAxis, YAxis
} from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {useStockStore} from "@/store/stock";

export const description = "A line chart with a label"

const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

const SummaryScreen = () => {
    const templates = useStockStore(state => state.items_templates)

    const [chart_data, setChart_data] = useState<any[]>([])

    const {data: stockSummary, isLoading, isError} = useQuery({
        queryKey: ['stockHistory-summary'],
        queryFn: getStockSummary,
        retry: 3,
    });

    useEffect(() => {
        if (stockSummary) {
            stockSummary.forEach(item => {
                setChart_data((prev) => [...prev, {
                    month: `${item.part_info.description_eng}`,
                    desktop: item.quantity,
                }])
            })
        }
    }, [stockSummary]);

    /*const chartData = useMemo<LocalChartItem[]>(() => {
        if (!stockSummary) return [];

        const map = new Map<string, LocalChartItem>();

        for (const item of stockSummary) {
            const warehouseKey = WAREHOUSE_MAP[item.warehouse];
            if (!warehouseKey) continue;

            if (!map.has(item.material_number)) {
                map.set(item.material_number, {
                    part:      item.material_number,
                    part_info: item.part_info,
                    GLPC:     0,
                    SMALL_P3: 0,
                    PNT:      0,
                    P3:       0,
                });
            }

            map.get(item.material_number)![warehouseKey] = item.quantity;
        }

        return Array.from(map.values());
    }, [stockSummary]);*/

    if (isLoading) return null;
    if (isError || !stockSummary) return <div>Failed to load stock summary.</div>;

    return (
        <div>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chart_data}
                        layout="vertical"
                        barSize={125}
                        barGap={125}
                        margin={{
                            left: 250,
                        }}
                    >
                        <XAxis type="number" dataKey="desktop" hide />
                        <YAxis
                            dataKey="month"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={25}  />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </div>
    );
};

export default SummaryScreen;