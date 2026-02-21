'use client'
import React, {useMemo} from 'react';
import {useQuery} from "@tanstack/react-query";
import {getStockSummary} from "@/futures/stock/getStockSummary";
import BasicLoading from "../BaseUI/BasicLoading";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";
import {IStockItemTemplate} from "@/types/stock/StockItem";

// ── Константы вне компонента ───────────────────────────────────────────────────

const WAREHOUSES = ["GLPC", "SMALL_P3", "PNT"] as const;
type Warehouse = typeof WAREHOUSES[number];

const WAREHOUSE_MAP: Record<string, Warehouse> = {
    GLPC:     "GLPC",
    SMALL_P3: "SMALL_P3",
    PNT:      "PNT",
};

const chartConfig = {
    GLPC:     { label: "GLPC",     color: "var(--chart-2)" },
    SMALL_P3: { label: "SMALL P3", color: "var(--chart-3)" },
    PNT:      { label: "PNT",      color: "var(--chart-4)" },
} satisfies ChartConfig;

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocalChartItem {
    part: string;
    part_info: IStockItemTemplate;
    GLPC: number;
    SMALL_P3: number;
    PNT: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

const SummaryScreen = () => {
    const {data: stockSummary, isLoading, isError} = useQuery({
        queryKey: ['stockHistory-summary'],
        queryFn: getStockSummary,
        retry: 3,
    });

    // useEffect + useState → useMemo
    const chartData = useMemo<LocalChartItem[]>(() => {
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
                });
            }

            map.get(item.material_number)![warehouseKey] = item.quantity;
        }

        return Array.from(map.values());
    }, [stockSummary]);

    if (isLoading) return <BasicLoading/>;
    if (isError || !stockSummary) return <div>Failed to load stock summary.</div>;

    return (
        <div>
            <CardHeader className="flex flex-col items-stretch border-b sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <CardTitle>Stock Summary</CardTitle>
                    <CardDescription>
                        Total amount of stock across GLPC, SMALL P3 and PNT warehouses.
                    </CardDescription>
                </div>

                <div className="flex">
                    {WAREHOUSES.map((key) => (
                        <button
                            key={key}
                            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                        >
                            <span className="text-xs text-muted-foreground text-nowrap">
                                {chartConfig[key].label}
                            </span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                {stockSummary
                                    .filter(item => item.warehouse === key)
                                    .reduce((sum, item) => sum + item.quantity, 0)
                                    .toLocaleString()
                                }
                            </span>
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
                    <BarChart data={chartData} margin={{left: 12, right: 12}}>
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="part"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                        />
                        <ChartTooltip content={<ChartTooltipContent/>}/>
                        {WAREHOUSES.map(key => (
                            <Bar key={key} dataKey={key} fill={`var(--color-${key})`}/>
                        ))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </div>
    );
};

export default SummaryScreen;