'use client'
import React, {useMemo} from 'react';
import {useQuery} from "@tanstack/react-query";
import {getStockSummary} from "@/futures/stock/getStockSummary";
import BasicLoading from "../BaseUI/BasicLoading";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Bar, BarChart, XAxis, YAxis} from "recharts";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {useStockStore} from "@/store/stock";


const WAREHOUSES = ["GLPC", "SMALL_P3", "PNT", "P3"] as const;
type Warehouse = typeof WAREHOUSES[number];

const WAREHOUSE_MAP: Record<string, Warehouse> = {
    GLPC:     "GLPC",
    SMALL_P3: "SMALL_P3",
    PNT:      "PNT",
    P3:       "P3",
};

const chartConfig = {
    GLPC:     { label: "GLPC",     color: "var(--chart-2)" },
    SMALL_P3: { label: "SMALL P3", color: "var(--chart-3)" },
    PNT:      { label: "PNT",      color: "var(--chart-4)" },
    P3:       { label: "P3",       color: "var(--chart-5)" },
} satisfies ChartConfig;


interface LocalChartItem {
    part: string;
    part_info: IStockItemTemplate;
    GLPC: number;
    SMALL_P3: number;
    PNT: number;
    P3: number;
}


const radii: Record<Warehouse, [number, number, number, number]> = {
    GLPC:     [0, 0, 4, 4],
    SMALL_P3: [0, 0, 0, 0],
    PNT:      [0, 0, 0, 0],
    P3:       [4, 4, 0, 0],
};


const SummaryScreen = () => {
    const templates = useStockStore(state => state.items_templates)
    const {data: stockSummary, isLoading, isError} = useQuery({
        queryKey: ['stockHistory-summary'],
        queryFn: getStockSummary,
        retry: 3,
    });

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
                    P3:       0,
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
                        Total amount of stock across GLPC, SMALL P3, PNT and P3 warehouses.
                    </CardDescription>
                </div>

                <div className="flex">
                    {WAREHOUSES.map((key) => (
                        <div
                            key={key}
                            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                        >
                            <span className="text-xs text-muted-foreground text-nowrap flex items-center gap-1.5">
                                <span
                                    className="inline-block h-2 w-2 rounded-sm"
                                    style={{background: chartConfig[key].color}}
                                />
                                {chartConfig[key].label}
                            </span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                {stockSummary
                                    .filter(item => item.warehouse === key)
                                    .reduce((sum, item) => sum + item.quantity, 0)
                                    .toLocaleString()
                                }
                            </span>
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{left: 12, right: 12}}
                    >
                        <XAxis
                            dataKey="part"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                        />
                        <YAxis
                            domain={[0, 'auto']}  // ← фиксируем низ на 0
                            tickLine={false}
                            axisLine={false}
                            width={25}
                            tickFormatter={(v) =>
                                v >= 1_000_000
                                    ? `${(v / 1_000_000).toFixed(0)}M`
                                    : v >= 1_000
                                        ? `${(v / 1_000).toFixed(0)}k`
                                        : v
                            }
                        />
                        <ChartTooltip
                            cursor={false}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                const template = templates?.find(item => item.material_number === label)

                                return (
                                    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
                                        <p className="font-medium text-xs  mb-2">{label}</p>
                                        <p className="font-medium mb-2">{template?.description_eng}</p>
                                        {payload.map((entry) => {
                                            const key = entry.dataKey as keyof typeof chartConfig;
                                            return (
                                                <div key={key} className="flex items-center gap-2 py-0.5">
                                                    <span
                                                        className="h-2 w-2 rounded-sm shrink-0"
                                                        style={{background: entry.fill}}
                                                    />
                                                    <span className="text-muted-foreground">
                                                        {chartConfig[key]?.label ?? key}
                                                    </span>
                                                    <span className="font-medium ml-auto pl-4">
                                                        {Number(entry.value).toLocaleString()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="GLPC"     stackId="stock" fill="var(--color-GLPC)"     radius={radii.GLPC}/>
                        <Bar dataKey="SMALL_P3" stackId="stock" fill="var(--color-SMALL_P3)" radius={radii.SMALL_P3}/>
                        <Bar dataKey="PNT"      stackId="stock" fill="var(--color-PNT)"      radius={radii.PNT}/>
                        <Bar dataKey="P3"       stackId="stock" fill="var(--color-P3)"       radius={radii.P3}/>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </div>
    );
};

export default SummaryScreen;