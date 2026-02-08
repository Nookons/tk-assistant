import React from 'react';
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {PolarAngleAxis, PolarGrid, Radar, RadarChart} from "recharts";
import {TrendingUp} from "lucide-react";


interface Item {
    key: string
    value: number
}

interface PropsData {
    title: string
    description?: string
    data: Item[]
}


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

const RadarKeyValue = ({ title, description, data }: PropsData) => {
    console.log(data);
    return (
        <Card className={`bg-muted/50 backdrop-blur-sm`}>
            <CardHeader className="items-center">
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square"
                >
                    <RadarChart
                        data={data}
                        margin={{
                            top: 15,
                            right: 65,
                            bottom: 15,
                            left: 65,
                        }}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <PolarAngleAxis
                            dataKey="key"
                            tick={({ x, y, textAnchor, value, index, ...props }) => {
                                const data_once = data[index]

                                return (
                                    <text
                                        x={x}
                                        y={index === 0 ? y - 20 : y}
                                        textAnchor={textAnchor}
                                        fontSize={13}
                                        fontWeight={500}
                                        {...props}
                                    >
                                        {/*<tspan>{data_once.value}</tspan>
                                        <tspan className="fill-muted-foreground">/</tspan>
                                        <tspan>{data_once.value}</tspan>*/}
                                        <tspan
                                            x={x}
                                            dy={"1rem"}
                                            fontSize={12}
                                            className="fill-foreground"
                                        >
                                            {data_once.key}
                                        </tspan>
                                    </text>
                                )
                            }}
                        />
                        <PolarGrid />
                        <Radar
                            dataKey="value"
                            fill="var(--color-desktop)"
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
};

export default RadarKeyValue;