"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { IShift } from "@/types/shift/shift"
import EmployeeStats from "@/components/shared/dashboard/employeeStats/EmployeeStats";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {useState} from "react";

export const description = "An interactive area chart"

interface ILocalShow {
    isRtKubot: boolean;
    isRtKubotMini: boolean;
    isRtKubotE2: boolean;
    isAbnormalLocations: boolean;
    isAbnormalCases: boolean;
}

const chartConfig = {
    rt_kubot_mini: { label: "RT Kubot Mini", color: "var(--rt-mini)" },
    rt_kubot_exc: { label: "RT Kubot EXC", color: "var(--rt-exc)" },
    rt_kubot_e2: { label: "RT Kubot E2", color: "var(--rt-e2)" },
    abnormal_locations: { label: "Abnormal Locations", color: "var(--rt-locations)" },
    abnormal_cases: { label: "Abnormal Cases", color: "var(--rt-cases)" },
} satisfies ChartConfig

const EmployeeTooltipContent = ({ payload, label, showState}: any) => {
    if (!payload || payload.length === 0) return null;

    // Берём первый элемент, чтобы достать full_employees
    const shiftData = payload[0].payload as IShift;

    return (
        <div className="bg-white dark:bg-background p-4 rounded-2xl shadow-md max-w-[250px]">
            <div className="font-bold text-sm mb-1">
                {new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>

            {shiftData.full_employees && shiftData.full_employees.length > 0 && (
                <div className="text-sm">
                    <ul className="list-disc list-inside">
                        {shiftData.full_employees.map((name) => (
                            <li className={`py-0.5 text-neutral-500`} key={name}>{name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Можно оставить значения графиков, если нужно */}
            <div className="mt-1 text-sm text-foreground">
                {showState.isRtKubot && <div>RT Kubot: {shiftData.rt_kubot_exc}</div>}
                {showState.isRtKubotMini && <div>RT Kubot Mini: {shiftData.rt_kubot_mini}</div>}
                {showState.isRtKubotE2 && <div>RT Kubot Mini: {shiftData.rt_kubot_mini}</div>}
                {showState.isAbnormalLocations && <div>Abnormal Locations: {shiftData.abnormal_locations}</div>}
                {showState.isAbnormalCases && <div>Abnormal Cases: {shiftData.abnormal_cases}</div>}
            </div>
        </div>
    );
};


export function ShiftsChart({ data, setShift_type}: { data: IShift[], setShift_type: (value: string) => void }) {
    const [timeRange, setTimeRange] = React.useState<"90d" | "30d" | "7d">("30d")

    const [showState, setShowState] = useState<ILocalShow>({
        isRtKubot: true,
        isRtKubotMini: true,
        isRtKubotE2: false,
        isAbnormalLocations: true,
        isAbnormalCases: true,
    })

    // Получаем referenceDate: либо последняя дата в данных, либо today
    const referenceDate = React.useMemo(() => {
        if (!data || data.length === 0) return new Date()
        const maxTs = data.reduce((max, it) => {
            const t = new Date(it.shift_date).getTime()
            return t > max ? t : max
        }, 0)
        return maxTs > 0 ? new Date(maxTs) : new Date()
    }, [data])

    // Фильтруем по диапазону дат (используем referenceDate из выше)
    const filteredData = React.useMemo(() => {
        let daysToSubtract = 90
        if (timeRange === "30d") daysToSubtract = 30
        else if (timeRange === "7d") daysToSubtract = 7

        const startDate = new Date(referenceDate)
        startDate.setDate(startDate.getDate() - daysToSubtract)

        // Для дебага можно раскомментировать
        // console.debug("referenceDate", referenceDate.toISOString(), "startDate", startDate.toISOString(), "timeRange", timeRange)

        return [...data]
            .slice() // чтобы не мутировать
            .reverse()
            .filter((item) => {
                const date = new Date(item.shift_date)
                return date >= startDate
            })
    }, [data, timeRange, referenceDate])

    // Суммируем по датам
    const summedData = React.useMemo(() => {
        const acc: Record<string, IShift> = {}

        for (const item of filteredData) {
            const dateKey = item.shift_date.toString() // или просто item.shift_date

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    ...item,
                    full_employees: [`${item.employee_name}-${item.shift_type.toUpperCase()}`]
                }
            } else {
                acc[dateKey].rt_kubot_exc = (acc[dateKey].rt_kubot_exc || 0) + (item.rt_kubot_exc || 0)
                acc[dateKey].rt_kubot_mini = (acc[dateKey].rt_kubot_mini || 0) + (item.rt_kubot_mini || 0)
                acc[dateKey].rt_kubot_e2 = (acc[dateKey].rt_kubot_e2 || 0) + (item.rt_kubot_e2 || 0)
                acc[dateKey].abnormal_locations = (acc[dateKey].abnormal_locations || 0) + (item.abnormal_locations || 0)
                acc[dateKey].abnormal_cases = (acc[dateKey].abnormal_cases || 0) + (item.abnormal_cases || 0)

                // Добавляем уникальное имя сотрудника
                const currentEmployees = new Set(acc[dateKey].full_employees)
                currentEmployees.add(`${item.employee_name}-${item.shift_type.toUpperCase()}`)
                acc[dateKey].full_employees = Array.from(currentEmployees)
            }
        }

        // Преобразуем в массив и сортируем по возрастанию даты
        const arr = Object.values(acc).sort((a, b) => {
            const ta = new Date(a.shift_date).getTime()
            const tb = new Date(b.shift_date).getTime()
            return ta - tb
        })

        // console.debug("summedData length", arr.length, arr.slice(0,3))
        return arr
    }, [filteredData])

    // Для визуального дебага: покажем текущие параметры
    React.useEffect(() => {
        console.debug("ShiftsChart debug", {
            referenceDate: referenceDate.toISOString(),
            timeRange,
            inputLength: data.length,
            filteredLength: filteredData.length,
            summedLength: summedData.length,
        })
    }, [referenceDate, timeRange, data.length, filteredData.length, summedData.length])

    return (
        <div>
            <div className={`mb-4 flex flex-wrap justify-between items-end gap-4`}>
                <EmployeeStats shifts={summedData} />
                <div className={`mb-4`}>
                    <Tabs onValueChange={(value) => setShift_type(value)}  defaultValue="all" className="w-[400px]">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="day">Day</TabsTrigger>
                            <TabsTrigger value="night">Night</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className={`flex flex-wrap gap-4`}>
                    <div className="flex flex-wrap gap-4 ">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isRtKubot"
                                checked={showState.isRtKubot}
                                onCheckedChange={() =>
                                    setShowState((prev) => ({ ...prev, isRtKubot: !prev.isRtKubot }))
                                }
                            />
                            <Label htmlFor="isRtKubot">RT Kubot</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isRtKubotMini"
                                checked={showState.isRtKubotMini}
                                onCheckedChange={() =>
                                    setShowState((prev) => ({ ...prev, isRtKubotMini: !prev.isRtKubotMini }))
                                }
                            />
                            <Label htmlFor="isRtKubotMini">RT Kubot Mini</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isRtKubotE2"
                                checked={showState.isRtKubotE2}
                                onCheckedChange={() =>
                                    setShowState((prev) => ({ ...prev, isRtKubotE2: !prev.isRtKubotE2 }))
                                }
                            />
                            <Label htmlFor="isRtKubotE2">RT Kubot E2</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isAbnormalLocations"
                                checked={showState.isAbnormalLocations}
                                onCheckedChange={() =>
                                    setShowState((prev) => ({ ...prev, isAbnormalLocations: !prev.isAbnormalLocations }))
                                }
                            />
                            <Label htmlFor="isAbnormalLocations">Abnormal Locations</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isAbnormalCases"
                                checked={showState.isAbnormalCases}
                                onCheckedChange={() =>
                                    setShowState((prev) => ({ ...prev, isAbnormalCases: !prev.isAbnormalCases }))
                                }
                            />
                            <Label htmlFor="isAbnormalCases">Abnormal Cases</Label>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="pt-0">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>Shifts Chart - Interactive</CardTitle>
                        <CardDescription>Displaying total shifts for the selected period</CardDescription>
                    </div>

                    <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "90d" | "30d" | "7d")}>
                        <SelectTrigger
                            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                            aria-label="Select time range"
                        >
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>

                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
                        <AreaChart data={summedData}>
                            <defs>
                                <linearGradient id="rt-exc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--rt-exc)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--rt-exc)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="rt-mini" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--rt-mini)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--rt-mini" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="rt-e" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--rt-e2)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--rt-e2)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="rt-locations" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--rt-locations)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--rt-locations)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="rt-cases" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--rt-cases)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--rt-cases)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="shift_date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                }}
                            />

                            <ChartTooltip
                                cursor={true}
                                content={<EmployeeTooltipContent showState={showState} />}
                            />


                            {showState.isRtKubot && <Area dataKey="rt_kubot_mini" type="natural" fill="url(#rt-mini)" stroke="var(--rt-mini)" stackId="a" />}
                            {showState.isRtKubotMini && <Area dataKey="rt_kubot_exc" type="natural" fill="url(#rt-exc)" stroke="var(--rt-exc)" stackId="b" />}
                            {showState.isRtKubotE2 && <Area dataKey="rt_kubot_e2" type="natural" fill="url(#rt-e)" stroke="var(--color-mobile)" stackId="c" />}
                            {showState.isAbnormalLocations && <Area dataKey="abnormal_locations" type="natural" fill="url(#rt-locations)" stroke="var(--rt-locations)" stackId="d" />}
                            {showState.isAbnormalCases && <Area dataKey="abnormal_cases" type="natural" fill="url(#rt-cases)" stroke="var(--rt-cases)" stackId="e" />}
                            <ChartLegend className={`opacity-0 md:opacity-100`} content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

        </div>
    )
}
