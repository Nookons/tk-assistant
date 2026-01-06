'use client';

import {useEffect, useState, useMemo} from 'react';
import {format} from 'date-fns';
import {ChevronDown} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';

import {getWorkDate} from '@/futures/Date/getWorkDate';
import {getInitialShift} from '@/futures/Date/getInitialShift';
import {getShiftList} from '@/futures/exception/getShiftList';
import {ErrorRecord, generateShiftReport} from '@/futures/PDF/shiftReport';
import {useRobotsStore} from '@/store/robotsStore';
import {toast} from 'sonner';
import dayjs from 'dayjs';

import type {IHistoryParts, IHistoryStatus} from '@/types/robot/robot';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {timeToString} from "@/utils/timeToString";
import StatusChanges from "@/components/shared/reports/DayReport/StatusChanges";
import {useQuery} from "@tanstack/react-query";
import {getStatusChanges} from "@/futures/reports/getStatusChanges";
import {getPartByNumber} from "@/futures/stock/getPartByNumber";
import {IStockItemTemplate} from "@/types/stock/StockItem";

export default function Page() {
    // Инициализируем стейт с явным значением
    const [date, setDate] = useState<Date>(() => {
        const initialDate = getWorkDate(new Date());
        console.log('Initial date from getWorkDate:', initialDate);
        return initialDate || new Date();
    });

    const [shift, setShift] = useState<'day' | 'night'>(() => {
        const initialShift = getInitialShift();
        console.log('Initial shift from getInitialShift:', initialShift);
        return initialShift;
    });

    const [data, setData] = useState<Record<string, ErrorRecord[]>>({});
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [parts_numbers, setParts_numbers] = useState<IStockItemTemplate[]>([])

    /* ------------------------- robots store ------------------------- */
    const robots = useRobotsStore((s) => s.robots);

    /* ------------------------- Эффект для отслеживания монтирования ------------------------- */
    useEffect(() => {
        setMounted(true);
        console.log('Component mounted');
    }, []);

    /* ------------------------- history for selected date & shift ------------------------- */
    const {data: status_history, isLoading, isError} = useQuery({
        queryKey: ['status_changes', date.toString(), shift],
        queryFn: () => getStatusChanges(dayjs(date).format('MM/DD/YYYY'), shift),
        refetchInterval: 1000
    })

    const {historyStatus, historyParts} = useMemo(() => {
        if (!date || !robots) return {historyStatus: [], historyParts: []};

        const dayKey = dayjs(date).format('YYYY-MM-DD');

        // Определяем временные границы смены
        let shiftStart: dayjs.Dayjs;
        let shiftEnd: dayjs.Dayjs;

        if (shift === 'day') {
            // Day shift: 06:00 - 18:00
            shiftStart = dayjs(date).hour(6).minute(0).second(0);
            shiftEnd = dayjs(date).hour(18).minute(0).second(0);
        } else {
            // Night shift: 18:00 - 06:00 (следующего дня)
            shiftStart = dayjs(date).hour(18).minute(0).second(0);
            shiftEnd = dayjs(date).add(1, 'day').hour(6).minute(0).second(0);
        }

        const hp: IHistoryParts[] = [];

        robots.forEach((r) => {
            // Фильтруем parts_history по времени смены
            r.parts_history
                .filter((h) => {
                    const createdAt = dayjs(h.created_at);
                    return createdAt.isAfter(shiftStart) && createdAt.isBefore(shiftEnd);
                })
                .forEach((h) => hp.push(h));
        });

        return {historyParts: hp};
    }, [robots, date, shift]);

    /* ------------------------- load exceptions ------------------------- */
    const loadExceptions = async () => {
        if (!date) {
            console.log('loadExceptions: date is undefined, skipping');
            return;
        }

        console.log('=== Starting loadExceptions ===');
        console.log('Date object:', date);
        console.log('Date type:', typeof date);
        console.log('Date toString:', date.toString());
        console.log('Date ISO:', date.toISOString());
        console.log('Shift:', shift);

        setLoading(true);

        try {
            // Форматируем дату в ISO формат (YYYY-MM-DD)
            const formattedDate = dayjs(date).format('YYYY-MM-DD');
            console.log('Formatted date for API:', formattedDate);

            const list = await getShiftList({date: formattedDate, shift_type: shift});

            console.log('API Response:', list);
            console.log('Response length:', list?.length);

            const grp: Record<string, ErrorRecord[]> = {};
            list.forEach((e: any) => (grp[e.employee] = [...(grp[e.employee] || []), e]));

            console.log('Grouped data:', grp);
            console.log('Grouped keys:', Object.keys(grp));

            setData(grp);

        } catch (error) {
            console.error('Error loading exceptions:', error);
            toast.error('Failed to load exceptions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('=== useEffect triggered ===');
        console.log('mounted:', mounted);
        console.log('date:', date);
        console.log('shift:', shift);

        if (mounted && date) {
            loadExceptions();
        }
    }, [mounted, date, shift]);

    /* ------------------------- PDF ------------------------- */
    const handlePdf = async () => {
        if (!date) return;
        if (status_history == undefined) return;

        try {
            setLoading(true);
            await generateShiftReport({
                report_data: data,
                date,
                shift,
                history_status: status_history,
                history_parts: historyParts,
                parts_numbers: parts_numbers,
            });
            toast.success('PDF report generated successfully!');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    const getPartsData = async () => {
        setParts_numbers([])
        const local_array: string[][] = []; // массив массивов строк

        historyParts.forEach((el) => {
            if (!el?.parts_numbers) return; // если нет parts_numbers, пропускаем

            try {
                const obj: string[] = JSON.parse(el.parts_numbers); // парсим JSON
                local_array.push(obj); // добавляем в массив
            } catch (e) {
                console.error("Ошибка парсинга parts_numbers:", e);
            }
        });

        // объединяем все массивы и создаём Set для уникальных значений
        const sorted = Array.from(new Set(local_array.flat()));

        for (const item of sorted) {
            const part = await getPartByNumber(item);
            setParts_numbers((prevState) => ([...prevState, part[0]]));
        }
    }

    useEffect(() => {
        getPartsData()
    }, [historyParts]);


    /* ------------------------- UI ------------------------- */
    return (
        <div className="mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>SHEIN REPORT PAGE</CardTitle>
                    <CardDescription>Shift exceptions and robot history</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                    <div className="grid md:grid-cols-2 items-center gap-4">
                        {/* DATE */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[200px] justify-between">
                                    {date ? format(date, 'PPP') : 'Pick date'}
                                    <ChevronDown className="ml-2 h-4 w-4"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus/>
                            </PopoverContent>
                        </Popover>

                        {/* SHIFT */}
                        <Select value={shift} onValueChange={(v) => setShift(v as 'day' | 'night')}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Shift</SelectLabel>
                                    <SelectItem value="day">Day (06:00-18:00)</SelectItem>
                                    <SelectItem value="night">Night (18:00-06:00)</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handlePdf} disabled={loading || !Object.keys(data).length}>
                        {loading ? 'Generating…' : 'PDF'}
                    </Button>
                </CardContent>
            </Card>

            {/* ---------- CONTENT ---------- */}



            <div className={`grid md:grid-cols-2 items-start gap-4`}>
                <div className={`overflow-hidden`}>
                    <StatusChanges date={date} shift={shift} />
                </div>

                {loading && (
                    <Card>
                        <CardContent className="pt-6">Loading…</CardContent>
                    </Card>
                )}

                {!loading && !Object.keys(data).length && (
                    <Card>
                        <CardContent className="pt-6 text-sm text-muted-foreground">
                            No errors for selected shift. (Date: {date ? format(date, 'PPP') : 'none'}, Shift: {shift})
                        </CardContent>
                    </Card>
                )}

                {!loading && Object.keys(data).length > 0 && (
                    <Accordion type="single" collapsible className="space-y-4 bg-muted p-4 rounded-lg">
                        {Object.entries(data).map(([emp, list], empIndex) => (
                            <AccordionItem value={emp} key={emp}>
                                <AccordionTrigger className="text-sm">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{emp}</CardTitle>
                                        <Badge variant="secondary">
                                            {list.length} error{list.length > 1 ? 's' : ''} · {list.reduce((s, e) => s + e.solving_time, 0)} min
                                        </Badge>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="text-sm space-y-2">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Robot</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Gap</TableHead>
                                                <TableHead>Start → End</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {list.map((e, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{e.error_robot}</TableCell>
                                                    <TableCell>{e.device_type}</TableCell>
                                                    <TableCell>{e.solving_time} min</TableCell>
                                                    <TableCell>{timeToString(e.error_start_time)} → {timeToString(e.error_end_time)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    );
}