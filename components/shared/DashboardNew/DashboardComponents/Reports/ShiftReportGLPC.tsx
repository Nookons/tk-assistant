import React, {useEffect, useState} from 'react';
import {useExceptionStore} from "@/store/exception";
import {getInitialShift} from "@/futures/date/getInitialShift";
import {getWorkDate} from "@/futures/date/getWorkDate";
import dayjs from "dayjs";
import {IRobotException} from "@/types/Exception/Exception";
import {IChangeRecord} from "@/types/Parts/ChangeRecord";
import {useMutation} from "@tanstack/react-query";
import {ReportService} from "@/services/reportService";
import {toast} from "sonner";
import {generateShiftReport} from "@/futures/pdf/shiftReport";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ButtonGroup} from "@/components/ui/button-group";
import {Calendar} from "@/components/ui/calendar";
import {format} from "date-fns";
import {ChevronDownIcon, FileDown, Loader2, Moon, Sun} from "lucide-react";
import ChangedPartsList from "@/components/shared/Lists/ChangedParts";
import ChangedStatus from "@/components/shared/Lists/ChangedStatus";
import Exception from "@/components/shared/Lists/Exception";
import {Separator} from "@/components/ui/separator";
import {useRobotsStore} from "@/store/robotsStore";
import {useUserStore} from "@/store/user";
import {useStockStore} from "@/store/stock";
import {IUser} from "@/types/user/user";

export interface IStatusHistory {
    id: number;
    user: IUser;
    add_by: number;
    robot_id: number;
    created_at: string;
    new_status: string;
    old_status: string;
    robot_number: number;
}

const ShiftReportGlpc = () => {
    const robots = useRobotsStore(state => state.robots);
    const user = useUserStore(state => state.currentUser)
    const set_exception_store = useExceptionStore(state => state.set_today_exception);
    const exception_data = useExceptionStore(state => state.today_exception)
    const parts_templates = useStockStore(state => state.items_templates)

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [shift_type, setShift_type] = useState<"day" | "night">(getInitialShift());
    const [date, setDate] = useState<Date | undefined>(getWorkDate(dayjs().toDate()));
    const [exception, setException] = useState<IRobotException[]>([]);
    const [changed_parts, setChanged_parts] = useState<IChangeRecord[]>([]);
    const [changed_status, setChanged_status] = useState<IStatusHistory[]>([]);

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
            acc[curr.employee].task_count += 1;
            return acc;
        }, {} as Record<string, { total_solving_time: number; task_count: number }>);

        const error_stats = exception.reduce((acc, curr) => {
            if (!acc[curr.first_column]) acc[curr.first_column] = {error_count: 0};
            acc[curr.first_column].error_count += 1;
            return acc;
        }, {} as Record<string, { error_count: number }>);

        const ArrayEmployee = Object.keys(employee_stats).map(key => ({employee: key, ...employee_stats[key]}));
        const ArrayError = Object.keys(error_stats).map(key => ({first_column: key, ...error_stats[key]}));

        if (!robots) {
            throw new Error("Could not find robots...");
        }
        if (!user) {
            throw new Error("Could not find user state...");
        }
        if (!parts_templates) {
            throw new Error("Could not find parts state...");
        }

        const warehouse_robots = robots.filter(robot => robot.warehouse === user.warehouse)
        const offline_robots = warehouse_robots.filter(robot => robot.status === '离线 | Offline')
        const online_robots = warehouse_robots.filter(robot => robot.status === '在线 | Online')

        await generateShiftReport({exception, changed_parts, changed_status, ArrayEmployee, ArrayError, date, offline_robots, online_robots, parts_templates});
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl">
                <div className="flex items-center gap-2">
                    <div className="gap-1.5 text-xs flex items-center gap-2">
                        {shift_type === "day"
                            ? <><Sun size={20} className="text-amber-500"/> Day Shift</>
                            : <><Moon size={20} className="text-blue-400"/> Night Shift</>
                        }
                    </div>
                    {date && (
                        <span className="text-xs text-muted-foreground">
                            {format(date, "PPP")}
                        </span>
                    )}
                    {isLoading && <Loader2 size={14} className="animate-spin text-muted-foreground"/>}
                    <div className="flex items-center justify-between">
                        {!isLoading && (
                            <Badge variant="secondary" className="text-xs text-muted-foreground">
                                {exception.length} records
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
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

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_680px] items-start gap-4">
                <div>
                    {isLoading
                        ? <Skeleton className="w-full h-[60vh]"/>
                        : <Exception data={exception_data.sort((a,b) => dayjs(b.error_start_time).valueOf() - dayjs(a.error_end_time).valueOf())} />
                    }
                </div>

                <div className="flex flex-col gap-8">
                    <div className={``}>
                        <div>
                            {isLoading
                                ? <Skeleton className="w-full h-[35vh]"/>
                                : <ChangedPartsList data={changed_parts}/>
                            }
                        </div>
                    </div>
                    <Separator />
                    <div className={``}>
                        <div>
                            {isLoading
                                ? <Skeleton className="w-full h-[35vh]"/>
                                : <ChangedStatus data={changed_status}/>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShiftReportGlpc;