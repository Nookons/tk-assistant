import React, {useEffect, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import {getMonthExceptions} from "@/futures/exception/getMonthExceptions";
import dayjs from "dayjs";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {Field, FieldLabel} from "@/components/ui/field";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import Image from "next/image";
import {IRobotException} from "@/types/Exception/Exception";

interface ExceptionDisplayProps {
    date: Date | null;
    setException_data: (data: IRobotException[]) => void;
}

const ExceptionDisplay = ({date, setException_data}: ExceptionDisplayProps) => {
    // ✅ Хуки ВСЕГДА вверху — до любых ранних return
    const [page,        setPage]        = useState<number>(1);
    const [items_count, setItems_count] = useState<number>(25);

    const {data, isLoading, isError} = useQuery({
        queryKey: ['month-report-exception', date],
        queryFn:  () => getMonthExceptions(dayjs(date!).format("YYYY-MM")),
        enabled:  !!date, // ✅ вместо if (!date) return null перед хуками
        retry: 3,
    });

    useEffect(() => {
        setException_data(data ?? []);
    }, [data]);

    // ✅ Ранний return — только после всех хуков
    if (!date) return null;

    const max_page    = Math.ceil((data?.length ?? 0) / items_count);
    const sliceStart  = (page - 1) * items_count;
    const sliceEnd    = page * items_count;
    const pageData    = data?.slice(sliceStart, sliceEnd) ?? [];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Exceptions
                        </CardTitle>
                        {!isLoading && data && (
                            <Badge variant="secondary" className="text-xs">
                                {data.length} records
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Rows per page */}
                        <Field orientation="horizontal">
                            <FieldLabel htmlFor="rows-select" className="text-xs whitespace-nowrap">
                                Rows
                            </FieldLabel>
                            <Select
                                defaultValue="25"
                                onValueChange={(v) => { setPage(1); setItems_count(Number(v)); }}
                            >
                                <SelectTrigger className="w-20 h-8 text-xs" id="rows-select">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectGroup>
                                        {[10, 25, 50, 100].map(n => (
                                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>

                        {/* Pagination */}
                        {max_page > 1 && (
                            <div className="flex items-center gap-1 min-w-[150px]">
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    ←
                                </Button>
                                <span className="text-xs text-muted-foreground px-2">
                                    {page} / {max_page}
                                </span>
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => setPage(p => Math.min(max_page, p + 1))}
                                    disabled={page === max_page}
                                >
                                    →
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-4 space-y-2">
                        {Array.from({length: 8}).map((_, i) => (
                            <Skeleton key={i} className="w-full h-10"/>
                        ))}
                    </div>
                ) : isError || !data ? (
                    <div className="flex items-center justify-center py-12 text-destructive text-sm">
                        Failed to load exceptions
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead className="text-xs">Robot</TableHead>
                                    <TableHead className="text-xs">Error</TableHead>
                                    <TableHead className="text-xs">Start</TableHead>
                                    <TableHead className="text-xs">End</TableHead>
                                    <TableHead className="text-xs">Gap (min)</TableHead>
                                    <TableHead className="text-xs">Operator</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pageData.map((error, i) => {
                                    const isHighRobot = Number(error.error_robot) > 150;
                                    const timeDiff    = dayjs(error.error_end_time).diff(error.error_start_time, "minute");
                                    const isLong      = timeDiff > 30;

                                    return (
                                        <TableRow key={`${error.error_robot}-${i}`}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Image
                                                        src={isHighRobot ? "/img/K50H_red.svg" : "/img/A42T_red.svg"}
                                                        alt="robot"
                                                        width={24}
                                                        height={24}
                                                    />
                                                    <span className="text-sm whitespace-nowrap">
                                                        {error.error_robot} — {error.device_type}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium">{error.first_column}</p>
                                                <p className="text-xs text-muted-foreground">{error.second_column}</p>
                                            </TableCell>
                                            <TableCell className="text-sm tabular-nums">
                                                {dayjs(error.error_start_time).format("HH:mm")}
                                            </TableCell>
                                            <TableCell className="text-sm tabular-nums">
                                                {dayjs(error.error_end_time).format("HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={isLong ? "destructive" : "secondary"}
                                                    className="text-xs font-bold tabular-nums"
                                                >
                                                    {timeDiff}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{error.employee}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ExceptionDisplay;