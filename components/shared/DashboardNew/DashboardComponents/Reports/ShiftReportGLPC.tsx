import React, {useEffect, useState} from 'react';
import {useExceptionStore} from "@/store/exception";
import {getInitialShift} from "@/futures/Date/getInitialShift";
import {getWorkDate} from "@/futures/Date/getWorkDate";
import dayjs from "dayjs";
import {IRobotException} from "@/types/Exception/Exception";
import {IChangeRecord} from "@/types/Parts/ChangeRecord";
import {IStatusHistory} from "@/components/shared/dashboard/ShiftStats/MonthStats";
import {useMutation} from "@tanstack/react-query";
import {ReportService} from "@/services/reportService";
import {toast} from "sonner";
import {generateShiftReport} from "@/futures/PDF/shiftReport";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ButtonGroup} from "@/components/ui/button-group";
import {Calendar} from "@/components/ui/calendar";
import {format} from "date-fns";
import {ChevronDownIcon, FileDown, Loader2, Moon, Sun} from "lucide-react";
import ExceptionDashboard from "@/components/shared/StatsDisplay/ExceptionDashboard";
import ChangedPartsList from "@/components/shared/Lists/ChangedParts";
import ChangedStatus from "@/components/shared/Lists/ChangedStatus";

// ── Component ─────────────────────────────────────────────────────────────────

const ShiftReportGlpc = () => {
    const set_exception_store = useExceptionStore(state => state.set_today_exception);

    const [isLoading,     setIsLoading]     = useState<boolean>(false);
    const [shift_type,    setShift_type]    = useState<"day" | "night">(getInitialShift());
    const [date,          setDate]          = useState<Date | undefined>(getWorkDate(dayjs().toDate()));
    const [exception,     setException]     = useState<IRobotException[]>([]);
    const [changed_parts, setChanged_parts] = useState<IChangeRecord[]>([]);
    const [changed_status,setChanged_status]= useState<IStatusHistory[]>([]);

    const getData = useMutation({
        mutationFn: async (params: { date: Date; shift_type: "day" | "night" }) =>
            ReportService.getDayData(params.date, params.shift_type),
        onSuccess: (data) => {
            setException(data[0] as IRobotException[]);
            setChanged_parts(data[1] as IChangeRecord[]);
            setChanged_status(data[2] as IStatusHistory[]);
            set_exception_store(data[0] as IRobotException[]);
            setIsLoading(false);
        },
        onError: (error) => {
            toast.error(error.message);
            setIsLoading(false);
        },
    });

    useEffect(() => {
        if (!date) return;
        setIsLoading(true);
        getData.mutate({date, shift_type});
    }, [date, shift_type]);

    const handlePDF = async () => {
        if (!date) return;

        const employee_stats = exception.reduce((acc, curr) => {
            if (!acc[curr.employee]) acc[curr.employee] = {total_solving_time: 0, task_count: 0};
            acc[curr.employee].total_solving_time += curr.solving_time;
            acc[curr.employee].task_count         += 1;
            return acc;
        }, {} as Record<string, {total_solving_time: number; task_count: number}>);

        const error_stats = exception.reduce((acc, curr) => {
            if (!acc[curr.first_column]) acc[curr.first_column] = {error_count: 0};
            acc[curr.first_column].error_count += 1;
            return acc;
        }, {} as Record<string, {error_count: number}>);

        const ArrayEmployee = Object.keys(employee_stats).map(key => ({employee: key, ...employee_stats[key]}));
        const ArrayError    = Object.keys(error_stats).map(key => ({first_column: key, ...error_stats[key]}));

        await generateShiftReport({exception, changed_parts, changed_status, ArrayEmployee, ArrayError, date});
    };

    return (
        <div className="space-y-4">

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1.5 text-xs">
                        {shift_type === "day"
                            ? <><Sun size={12} className="text-amber-500"/> Day Shift</>
                            : <><Moon size={12} className="text-blue-400"/> Night Shift</>
                        }
                    </Badge>
                    {date && (
                        <span className="text-xs text-muted-foreground">
                            {format(date, "PPP")}
                        </span>
                    )}
                    {isLoading && <Loader2 size={14} className="animate-spin text-muted-foreground"/>}
                </div>

                <div className="flex items-center gap-2">
                    {/* Date picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                data-empty={!date}
                                className="data-[empty=true]:text-muted-foreground justify-between font-normal"
                            >
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                <ChevronDownIcon size={14}/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                defaultMonth={date}
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Shift select */}
                    <Select value={shift_type} onValueChange={(v) => setShift_type(v as "day" | "night")}>
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Shift"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="day">
                                    <span className="flex items-center gap-2"><Sun size={13}/> Day</span>
                                </SelectItem>
                                <SelectItem value="night">
                                    <span className="flex items-center gap-2"><Moon size={13}/> Night</span>
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* PDF export */}
                    <ButtonGroup>
                        <Button
                            size="sm"
                            onClick={handlePDF}
                            disabled={isLoading || exception.length === 0}
                            className="gap-2"
                        >
                            <FileDown size={14}/>
                            PDF
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_680px] items-start gap-4">

                {/* Left: Exceptions */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Exceptions
                            </CardTitle>
                            {!isLoading && (
                                <Badge variant="secondary" className="text-xs">
                                    {exception.length} records
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* ✅ Правильное условие скелетона — только isLoading */}
                        {isLoading
                            ? <Skeleton className="w-full h-[60vh]"/>
                            : <ExceptionDashboard/>
                        }
                    </CardContent>
                </Card>

                {/* Right: Parts + Status */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    Maintenance
                                </CardTitle>
                                {!isLoading && (
                                    <Badge variant="secondary" className="text-xs">
                                        {changed_parts.length} records
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading
                                ? <Skeleton className="w-full h-[35vh]"/>
                                : <ChangedPartsList data={changed_parts}/>
                            }
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    Status Changes
                                </CardTitle>
                                {!isLoading && (
                                    <Badge variant="secondary" className="text-xs">
                                        {changed_status.length} records
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading
                                ? <Skeleton className="w-full h-[35vh]"/>
                                : <ChangedStatus data={changed_status}/>
                            }
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ShiftReportGlpc;