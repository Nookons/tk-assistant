import React from "react"
import {
    Pie,
    PieChart,
    Sector,
    Label, Cell, LabelList,
} from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { ChartConfig } from "@/components/ui/chart"

const staticChartConfig: ChartConfig = {
    value: {
        label: "Value",
    },
}

interface PieItem {
    key: string
    value: number
}

interface PieKeyValueProps {
    title: string
    description?: string
    data: PieItem[]
}

const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
]


const PieKeyValue = ({ title, description, data }: PieKeyValueProps) => {
    const [activeLabel, setActiveLabel] = React.useState(data[0]?.key)

    const activeIndex = React.useMemo(
        () => data.findIndex(item => item.key === activeLabel),
        [activeLabel, data]
    )

    const activeItem = data[activeIndex]

    return (
        <div className="flex flex-col backdrop-blur-2xl p-4 rounded-xl">
            <div className="flex-row items-start space-y-0 pb-0">
                <div className="grid gap-1">
                    <div className={`flex items-center gap-4 ${description ? 'justify-between' : 'justify-end'}`}>
                        <CardTitle className={`text-nowrap`}>{title}</CardTitle>
                        <Select value={activeLabel} onValueChange={setActiveLabel}>
                            <SelectTrigger className="ml-auto h-7 w-full rounded-lg pl-2.5">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end">
                                {data.map(item => (
                                    <SelectItem key={item.key} value={item.key}>
                                        {item.key}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {description && (
                        <CardDescription>{description}</CardDescription>
                    )}
                </div>
            </div>

            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer
                    config={staticChartConfig}
                    className="mx-auto aspect-square w-full max-w-[300px]"
                >
                    <PieChart>
                        {/*<ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />*/}

                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="key"
                            innerRadius={85}
                            strokeWidth={15}
                            activeIndex={activeIndex}
                            activeShape={({ outerRadius = 0, ...props }) => (
                                <g>
                                    <Sector {...props} outerRadius={outerRadius + 0} />
                                    <Sector
                                        {...props}
                                        outerRadius={outerRadius + 10}
                                        innerRadius={outerRadius + 5}
                                    />
                                </g>
                            )}
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}

                            <Label
                                content={({ viewBox }) => {
                                    if (!viewBox || !("cx" in viewBox)) return null

                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan className="fill-foreground text-3xl font-bold">
                                                {activeItem?.value.toLocaleString() ?? 0}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                dy={34}
                                                className="fill-foreground text-base"
                                            >
                                                {activeItem?.key}
                                            </tspan>
                                        </text>
                                    )
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </div>
    )
}

export default PieKeyValue
