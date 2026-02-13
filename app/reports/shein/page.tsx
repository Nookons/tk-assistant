'use client'
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import React, {useEffect, useState} from 'react';
import {format} from "date-fns";
import {getWorkDate} from "@/futures/Date/getWorkDate";
import dayjs from "dayjs";
import {getInitialShift} from "@/futures/Date/getInitialShift";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useMutation} from "@tanstack/react-query";
import {ReportService} from "@/services/reportService";
import {IRobotException} from "@/types/Exception/Exception";
import {IChangeRecord} from "@/types/Parts/ChangeRecord";
import {toast} from "sonner";
import ExceptionDashboard from "@/components/shared/StatsDisplay/ExceptionDashboard";
import ChangedPartsList from "@/components/shared/Lists/ChangedParts";
import ChangedStatus from "@/components/shared/Lists/ChangedStatus";
import {ButtonGroup} from "@/components/ui/button-group";
import {Skeleton} from "@/components/ui/skeleton";
import {useExceptionStore} from "@/store/exception";
import {generateShiftReport} from "@/futures/PDF/shiftReport";
import {IStatusHistory} from "@/components/shared/dashboard/ShiftStats/MonthStats";

const Page = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const set_exception_store = useExceptionStore(state => state.set_today_exception)

    const [shift_type, setShift_type] = useState<"day" | "night">(getInitialShift())
    const [date, setDate] = React.useState<Date | undefined>(
        getWorkDate(dayjs().toDate())
    )

    const [exception, setException] = useState<IRobotException[]>([])
    const [changed_parts, setChanged_parts] = useState<IChangeRecord[]>([])
    const [changed_status, setChanged_status] = useState<IStatusHistory[]>([])

    const getData = useMutation({
        mutationFn: async (params: { date: Date; shift_type: "day" | "night" }) =>
            ReportService.getDayData(params.date, params.shift_type),
        onSuccess: (data) => {
            setException(data[0] as IRobotException[])
            setChanged_parts(data[1] as IChangeRecord[])
            setChanged_status(data[2] as IStatusHistory[])

            set_exception_store(data[0] as IRobotException[])

            setIsLoading(false)
        },
        onError: (error) => {
            toast.error(error.message)
            setIsLoading(false)
        }
    })

    useEffect(() => {
        if (!date) return;
        setIsLoading(true)
        getData.mutate({date, shift_type});

    }, [date, shift_type]);

    const handlePDF = async () => {
        const employee_stats = exception.reduce((acc, curr) => {
            if (!acc[curr.employee]) {
                acc[curr.employee] = {
                    total_solving_time: 0,
                    task_count: 0
                };
            }

            acc[curr.employee].total_solving_time += curr.solving_time;
            acc[curr.employee].task_count += 1;

            return acc;
        }, {} as Record<string, { total_solving_time: number; task_count: number }>);

        const error_stats = exception.reduce((acc, curr) => {
            if (!acc[curr.first_column]) {
                acc[curr.first_column] = {
                    error_count: 0
                };
            }

            acc[curr.first_column].error_count += 1;

            return acc;
        }, {} as Record<string, { error_count: number; }>);

        const ArrayEmployee = Object.keys(employee_stats).map(key => ({employee: key, ...employee_stats[key]}))
        const ArrayError = Object.keys(error_stats).map(key => ({first_column: key, ...error_stats[key]}))

        if (!date) return;
        await generateShiftReport({exception, changed_parts, changed_status, ArrayEmployee, ArrayError, date})
    }

    return (
        <div className={`min-h-[80vh]`}>
            <div className={`flex flex-col items-end gap-4 backdrop-blur-xl  p-2 h-full`}>
                <div className={`flex justify-end gap-4`}>
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    data-empty={!date}
                                    className="data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal"
                                >
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    defaultMonth={date}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Select value={shift_type} onValueChange={(e) => setShift_type(e as "day" | "night")}>
                            <SelectTrigger className="w-full max-w-48">
                                <SelectValue placeholder="Select a shift" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="day">Day</SelectItem>
                                    <SelectItem value="night">Night</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <ButtonGroup>
                        <Button
                            onClick={handlePDF}
                            disabled={isLoading}
                        >
                            PDF
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
            <div className={`grid md:grid-cols-[1fr_700px] items-start gap-4 mt-4 px-2`}>
                {isLoading && exception
                    ? <Skeleton className={`w-full h-[80vh]`}/>
                    :
                    <div className={`overflow-hidden`}>
                        <ExceptionDashboard />
                    </div>
                }

                <div className={`grid grid-cols-[1fr] gap-4`}>
                    {isLoading && changed_parts
                        ? <Skeleton className={`w-full h-[40vh]`}/>
                        :
                        <div className={`space-y-2 overflow-hidden`}>
                            <article className={`font-bold text-xl`}>Maintance</article>
                            <ChangedPartsList data={changed_parts} />
                        </div>
                    }
                    {isLoading && changed_status
                        ? <Skeleton className={`w-full h-[40vh]`}/>
                        :
                        <div className={`space-y-2 overflow-hidden`}>
                            <hr className={`my-4`}/>
                            <ChangedStatus data={changed_status} />
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default Page;