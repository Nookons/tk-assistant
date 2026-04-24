"use client"
import React, {useEffect, useState} from "react"
import {Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis, Pie, PieChart} from "recharts"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig} from "@/components/ui/chart"
import {useSessionStore} from "@/store/session"
import {ExceptionService} from "@/services/exceptionService"
import {toast} from "sonner"
import {IRobot} from "@/types/robot/robot";
import {Skeleton} from "@/components/ui/skeleton";

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
]

const chartConfig = {
    count: {label: "Errors"},
    label: {color: "var(--background)"},
} satisfies ChartConfig

const RobotsStats = () => {
    const session = useSessionStore((state) => state.currentSession)

    const [loading, setLoading] = useState(true)

    const [first_robot, setFirst_robot] = useState<IRobot | null>(null)

    const [chartData, setChartData] = useState<
        { error_robot: string; count: number }[]
    >([])

    const [chardFirstData, setChardFirstData] = useState<
        { error_type: string; count: number }[]
    >([])

    const getHistoryData = async () => {
        try {
            const response =
                await ExceptionService.getExceptionsChartHistory(
                    session?.warehouse_sessions ?? ""
                )

            if (!response || response.length === 0) {
                setChartData([])
                setChardFirstData([])
                return
            }

            const errors_robot = response.reduce((acc, curr) => {
                acc[curr.error_robot] = (acc[curr.error_robot] ?? 0) + 1
                return acc
            }, {} as Record<string, number>)

            const sorted = Object.entries(errors_robot)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([error_robot, count]) => ({error_robot, count}))

            setChartData(sorted)

            if (sorted.length === 0) return

            const firstRobot = sorted[0].error_robot

            const firstData = response.filter(
                (item) => item.error_robot?.toString() === firstRobot
            )

            const errors_robot_first = firstData.reduce((acc, curr) => {
                acc[curr.first_column] = (acc[curr.first_column] ?? 0) + 1
                return acc
            }, {} as Record<string, number>)

            setChardFirstData(
                Object.entries(errors_robot_first).map(([error_type, count]) => ({
                    error_type,
                    count,
                }))
            )
        } catch (error: any) {
            console.error(error)
            toast.error(error?.toString?.() ?? "Unknown error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!session?.warehouse_sessions) return
        getHistoryData()
    }, [session?.warehouse_sessions])

    if (loading) return (
        <Skeleton className={`w-full h-100`} />
    )

    return (
        <div className="grid grid-cols-3 gap-2">

            {/* TOP ROBOTS BAR CHART */}

            <Card className={`col-span-3 md:col-span-2`}>
                <CardHeader>
                    <CardTitle>Top 10 Robots</CardTitle>
                    <CardDescription>
                        Data for the last 2 months. Robots with the most errors should be
                        checked by maintenance. {session?.warehouse_sessions}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <ChartContainer
                        config={chartConfig}
                        style={{height: `${chartData.length * 28.7}px`}}
                        className="w-full"
                    >
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            layout="vertical"
                            margin={{right: 52, left: 8}}
                            barCategoryGap="20%"
                        >
                            <CartesianGrid horizontal={false} stroke="var(--border)"/>

                            <YAxis
                                dataKey="error_robot"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                hide
                            />

                            <XAxis dataKey="count" type="number" hide/>

                            <ChartTooltip
                                cursor={{fill: "var(--muted)", opacity: 0.4}}
                                content={<ChartTooltipContent indicator="line"/>}
                            />

                            <Bar dataKey="count" radius={4}>
                                {chartData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                    />
                                ))}

                                <LabelList
                                    dataKey="error_robot"
                                    position="insideLeft"
                                    offset={10}
                                    className="fill-(--color-label)"
                                    fontSize={12}
                                    fontWeight={500}
                                />

                                <LabelList
                                    dataKey="count"
                                    position="right"
                                    offset={8}
                                    className="fill-foreground"
                                    fontSize={12}
                                    fontWeight={500}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* PIE CHART */}

            <Card className="flex flex-col col-span-3 md:col-span-1">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Error Types (Top Robot)</CardTitle>
                    <CardDescription>
                        Distribution of error types for the robot with the most errors
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-0">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[250px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                content={<ChartTooltipContent nameKey="error_type" hideLabel/>}
                            />

                            <Pie
                                data={chardFirstData}
                                dataKey="count"
                                nameKey="error_type"
                                labelLine={false}
                                label={({payload, ...props}) => (
                                    <text
                                        cx={props.cx}
                                        cy={props.cy}
                                        x={props.x}
                                        y={props.y}
                                        textAnchor={props.textAnchor}
                                        dominantBaseline={props.dominantBaseline}
                                        fill="var(--foreground)"
                                        fontSize={12}
                                    >
                                        {payload.count}
                                    </text>
                                )}
                            >
                                {chardFirstData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

        </div>
    )
}

export default RobotsStats
