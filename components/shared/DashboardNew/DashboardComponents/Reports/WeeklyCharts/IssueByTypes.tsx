"use client"

import { TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { IRobotException } from "@/types/Exception/Exception"

// Только те цвета, которые определены в :root и .dark
const CHART_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
]

interface ChartDataItem {
    issue: string
    count: number
    color: string
}

export function IssuesByTypes({ exceptions_data }: { exceptions_data: IRobotException[] | null | undefined }) {
    if (!exceptions_data) return null

    const grouped = exceptions_data.reduce((acc, item) => {
        const key = item.first_column || "Unknown"
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const chartData: ChartDataItem[] = Object.entries(grouped)
        .map(([issue, count]) => ({ issue, count }))
        .sort((a, b) => b.count - a.count)
        .map((item, idx) => ({
            ...item,
            color: CHART_COLORS[idx % CHART_COLORS.length],
        }))

    const totalIssues = chartData.reduce((sum, item) => sum + item.count, 0)

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload as ChartDataItem
            const percentage = ((data.count / totalIssues) * 100).toFixed(1)
            return (
                <div className="rounded-lg border bg-background p-2 shadow-md">
                    <p className="font-medium">{data.issue}</p>
                    <p className="text-sm text-muted-foreground">
                        {data.count} issues ({percentage}%)
                    </p>
                </div>
            )
        }
        return null
    }

    const renderLegend = (props: any) => {
        const { payload } = props
        return (
            <ul className="flex flex-wrap justify-center gap-3 text-xs">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center gap-1">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span>{entry.value}</span>
                        <span className="font-mono text-muted-foreground">
              ({((entry.payload.count / totalIssues) * 100).toFixed(0)}%)
            </span>
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Issues by Type</CardTitle>
                <CardDescription>This Week</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 pb-0">
                <div className="mx-auto aspect-square max-h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="issue"
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="80%"
                                paddingAngle={2}
                                cornerRadius={4}
                                animationDuration={800}
                                animationBegin={200}
                                label={({ percent }) => {
                                    const pct = percent * 100
                                    return pct >= 10 ? `${pct.toFixed(0)}%` : ''
                                }}
                                labelLine={false}
                            >
                                {chartData.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                content={renderLegend}
                                verticalAlign="bottom"
                                height={60}
                                wrapperStyle={{ paddingTop: "1rem" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>

            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Total issues: {totalIssues} <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Robot issues grouped by type
                </div>
            </CardFooter>
        </Card>
    )
}