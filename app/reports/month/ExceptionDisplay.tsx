import React, {ReactNode, useEffect, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import {getMonthExceptions} from "@/futures/exception/getMonthExceptions";
import dayjs from "dayjs";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Image from "next/image";
import {Field, FieldLabel} from "@/components/ui/field";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent, PaginationEllipsis,
    PaginationItem, PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {toast} from "sonner";
import {IRobotException} from "@/types/Exception/Exception";


const ExceptionDisplay = ({date, setException_data}: {date: Date | null, setException_data: (data: IRobotException[]) => void}) => {
    if (!date) return null;

    const [page, setPage] = useState<number>(1);
    const [items_count, setItems_count] = useState<number>(25)


    const {data, isLoading, isError} = useQuery({
        queryKey: ['month-report-exception', date],
        queryFn: () => getMonthExceptions(dayjs(date).format("YYYY-MM")),
        retry: 3
    })

    useEffect(() => {
        setException_data([])

        if (data) {
            const today_records_exceptions = data.filter(item => dayjs(item.error_start_time).format('DD/MM/YYYY') === '11/01/2026');
            console.log(today_records_exceptions);

            setException_data(data)
        }
    }, [data]);


    if (isLoading) return <div>Loading...</div>;
    if (!data) return <div>Error: {isError ? "Failed to fetch data" : "Unknown error"}</div>;

    const max_page = Math.ceil(data.length / items_count);

    return (
        <div className={`mt-4`}>
            <div className="flex items-center justify-between gap-4 my-4 overflow-hidden">
                <div>
                    <Field orientation="horizontal">
                        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
                        <Select onValueChange={(e) => {
                            setPage(1)
                            setItems_count(Number(e))
                        }} defaultValue="25">
                            <SelectTrigger className="w-20" id="select-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
                <div>
                    <Pagination>
                        <PaginationContent>
                            {page - 1 > 0 &&
                                <PaginationItem>
                                    <PaginationPrevious onClick={() => setPage((prev) => prev - 1)} href="#" />
                                </PaginationItem>
                            }
                            {page - 1 > 0 &&
                                <PaginationItem>
                                    <PaginationLink onClick={() => setPage(page - 1)} href="#">
                                        {page - 1}
                                    </PaginationLink>
                                </PaginationItem>
                            }
                            <PaginationItem>
                                <PaginationLink href="#" isActive>
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                            {page + 1 <= max_page &&
                                <PaginationItem>
                                    <PaginationLink onClick={() => setPage(page + 1)} href="#">
                                        {page + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            }
                            {page + 1 <= max_page &&
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            }
                            {page + 1 <= max_page &&
                                <PaginationItem>
                                    <PaginationNext onClick={() => setPage((prev) => prev + 1)} href="#" />
                                </PaginationItem>
                            }
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            {data &&
                <div className={`overflow-hidden`}>
                    <Table>
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead>Robot</TableHead>
                                <TableHead>Error</TableHead>
                                <TableHead>Recovery</TableHead>
                                <TableHead>Start</TableHead>
                                <TableHead>End</TableHead>
                                <TableHead>Gap (min)</TableHead>
                                <TableHead>Operator</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.slice(page === 1 ? 0 : (items_count * page) - items_count, items_count * page).map((error, i) => {
                                const isHighRobot = Number(error.error_robot) > 150;
                                const timeDiff = dayjs(error.error_end_time).diff(
                                    error.error_start_time,
                                    'minute'
                                );

                                return (
                                    <TableRow key={i}>
                                        <TableCell className="font-bold">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <Image
                                                        src={isHighRobot ? `/img/K50H_red.svg` : `/img/A42T_red.svg`}
                                                        alt="robot"
                                                        width={30}
                                                        height={30}
                                                    />
                                                </div>
                                                <article>
                                                    {error.error_robot} - {error.device_type}
                                                </article>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">
                                                {error.first_column}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {error.second_column}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">
                                                {error.issue_description}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {error.recovery_title}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {dayjs(error.error_start_time).format("HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            {dayjs(error.error_end_time).format("HH:mm")}
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {timeDiff}
                                        </TableCell>
                                        <TableCell>{error.employee}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            }
        </div>
    );
};

export default ExceptionDisplay;