'use client'
import React, {useEffect, useState} from 'react';
import { useQuery } from "@tanstack/react-query";
import { getStockSummary } from "@/futures/stock/getStockSummary";
import BasicLoading from "../BaseUI/BasicLoading";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";
import {IStockItemTemplate} from "@/types/stock/StockItem";


const chartConfig = {
    GLPC: {
        label: "GLPC",
        color: "var(--chart-2)",
    },
    SMALL_P3: {
        label: "SMALL P3",
        color: "var(--chart-3)",
    },
    PNT: {
        label: "PNT",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig

interface LocalChartItem {
    part: string;
    part_info: IStockItemTemplate;
    GLPC: number;
    SMALL_P3: number;
    PNT: number;
}

const SummaryScreen = () => {
    const { data: stockSummary, isLoading, isError } = useQuery({
        queryKey: ['stockHistory-summary'],
        queryFn: getStockSummary,
        retry: 3,
    })

    const [chartData, setChartData] = useState<LocalChartItem[]>([])

    const WAREHOUSE_MAP = {
        "GLPC": "GLPC",
        "SMALL_P3": "SMALL_P3",
        "PNT": "PNT",
    } as const


    useEffect(() => {
        if (!stockSummary) return
        const map = new Map<string, LocalChartItem>()

        stockSummary.forEach(item => {
            if (!map.has(item.material_number)) {
                map.set(item.material_number, {
                    part: item.material_number,
                    part_info: item.part_info,
                    GLPC: 0,
                    SMALL_P3: 0,
                    PNT: 0,
                })
            }

            const warehouseKey = WAREHOUSE_MAP[item.warehouse as keyof typeof WAREHOUSE_MAP]
            if (!warehouseKey) return

            map.get(item.material_number)![warehouseKey] = item.quantity
        })

        console.log(Array.from(map.values()));
        setChartData(Array.from(map.values()))
    }, [stockSummary])

    if (isLoading) return <BasicLoading />;
    if (isError) return <div>Failed to load stock summary.</div>;
    if (!stockSummary) return <div>Failed to load stock summary.</div>;

    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch border-b sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3">
                    <CardTitle>Bar Chart - Interactive</CardTitle>
                    <CardDescription>
                        Showing total amount of stock in GLPC and SMALL P3 warehouses.
                    </CardDescription>
                </div>
                <div className="flex">
                    {["GLPC", "SMALL_P3", "PNT"].map((key) => {
                        const chart = key as keyof typeof chartConfig
                        return (
                            <button
                                key={chart}
                                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                            >
                                <span className="text-muted-foreground text-nowrap text-xs">
                                  {key}
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                  {stockSummary.filter((item) => item.warehouse === key).reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[280px] w-full"
                >
                    <BarChart
                        data={chartData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />

                        <XAxis
                            dataKey="part"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                        />

                        <ChartTooltip content={<ChartTooltipContent />} />

                        <Bar dataKey="GLPC" fill="var(--color-GLPC)" />
                        <Bar dataKey="SMALL_P3" fill="var(--color-SMALL_P3)" />
                        <Bar dataKey="PNT" fill="var(--color-PNT)" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default SummaryScreen;
