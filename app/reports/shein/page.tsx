'use client';
import {useEffect, useState, useMemo} from 'react';
import {format} from 'date-fns';
import {ChevronDown, Equal, MoveRight, Pencil, Trash2} from 'lucide-react';
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
import {ButtonGroup} from "@/components/ui/button-group";

export default function Page() {
    const [date, setDate] = useState(() => {
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

    const robots = useRobotsStore((s) => s.robots);

    useEffect(() => {
        setMounted(true);
        console.log('Component mounted');
    }, []);

    const {data: status_history, isLoading, isError} = useQuery({
        queryKey: ['status_changes', date.toString(), shift],
        queryFn: () => getStatusChanges(dayjs(date).format('MM/DD/YYYY'), shift),
        refetchInterval: 1000
    })

    const {historyStatus, historyParts} = useMemo(() => {
        if (!date || !robots) return {historyStatus: [], historyParts: []};

        const dayKey = dayjs(date).format('YYYY-MM-DD');

        let shiftStart: dayjs.Dayjs;
        let shiftEnd: dayjs.Dayjs;

        if (shift === 'day') {
            shiftStart = dayjs(date).hour(6).minute(0).second(0);
            shiftEnd = dayjs(date).hour(18).minute(0).second(0);
        } else {
            shiftStart = dayjs(date).hour(18).minute(0).second(0);
            shiftEnd = dayjs(date).add(1, 'day').hour(6).minute(0).second(0);
        }

        const hp: IHistoryParts[] = [];

        robots.forEach((r) => {
            r.parts_history
                .filter((h) => {
                    const createdAt = dayjs(h.created_at);
                    return createdAt.isAfter(shiftStart) && createdAt.isBefore(shiftEnd);
                })
                .forEach((h) => hp.push(h));
        });

        return {historyParts: hp};
    }, [robots, date, shift]);

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
        const local_array: string[][] = [];

        historyParts.forEach((el) => {
            if (!el?.parts_numbers) return;
            try {
                const obj: string[] = JSON.parse(el.parts_numbers);
                local_array.push(obj);
            } catch (e) {
                console.error("Ошибка парсинга parts_numbers:", e);
            }
        });

        const sorted = Array.from(new Set(local_array.flat()));

        for (const item of sorted) {
            const part = await getPartByNumber(item);
            setParts_numbers((prevState) => ([...prevState, part[0]]));
        }
    }

    useEffect(() => {
        getPartsData()
    }, [historyParts]);

    return (
        <div className="min-h-screen p-2 md:p-8">
            <div className="mx-auto max-w-7xl shadow-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl md:text-3xl font-bold">SHEIN REPORT PAGE</CardTitle>
                    <CardDescription className="">
                        Shift exceptions and robot history
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 p-4 md:p-6">
                    {/* Filters - теперь адаптивные */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* DATE */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-[240px] justify-start text-left font-normal">
                                    <ChevronDown className="mr-2 h-4 w-4"/>
                                    {date ? format(date, 'PPP') : 'Pick date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => d && setDate(d)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {/* SHIFT */}
                        <Select value={shift} onValueChange={(v) => setShift(v as 'day' | 'night')}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Select shift"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Shift</SelectLabel>
                                    <SelectItem value="day">Day (06:00-18:00)</SelectItem>
                                    <SelectItem value="night">Night (18:00-06:00)</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handlePdf}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            {loading ? 'Generating…' : 'PDF'}
                        </Button>
                    </div>

                    <Separator/>

                    {/* CONTENT */}
                    <div className="space-y-4">
                        <StatusChanges date={date} shift={shift}/>

                        {loading && (
                            <div className="flex h-64 items-center justify-center">
                                <p className="text-muted-foreground">Loading…</p>
                            </div>
                        )}

                        {!loading && !Object.keys(data).length && (
                            <Card className=" ">
                                <CardContent className="p-6 text-center">
                                    <p className="">
                                        No errors for selected shift.
                                        <br/>
                                        <span className="text-sm ">
                                          (Date: {date ? format(date, 'PPP') : 'none'}, Shift: {shift})
                                        </span>
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {!loading && Object.keys(data).length > 0 && (
                            <Accordion type="multiple" className="space-y-2 mt-4">
                                {Object.entries(data).map(([emp, list], empIndex) => (
                                    <AccordionItem
                                        key={empIndex}
                                        value={`emp-${empIndex}`}
                                        className="overflow-hidden rounded-lg"
                                    >
                                        <AccordionTrigger className="px-4 ">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
                                                <span className="font-semibold">{emp}</span>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Badge variant="destructive">
                                                        {list.length} error{list.length > 1 ? 's' : ''}
                                                    </Badge>
                                                    <Badge variant="secondary">
                                                        {list.reduce((s, e) => s + e.solving_time, 0)} min
                                                    </Badge>
                                                </div>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="px-0 pb-0">
                                            {/* Desktop table - скрыта на мобильных */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Robot</TableHead>
                                                            <TableHead>Type</TableHead>
                                                            <TableHead>Gap</TableHead>
                                                            <TableHead>Start → End</TableHead>
                                                            <TableHead className="text-right">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {list.map((e, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell className="font-medium">{e.error_robot}</TableCell>
                                                                <TableCell>{e.device_type}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">{e.solving_time} min</Badge>
                                                                </TableCell>
                                                                <TableCell className="text-sm text-muted-foreground">
                                                                    {timeToString(e.error_start_time)} → {timeToString(e.error_end_time)}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button variant="ghost" size="icon">
                                                                            <Pencil className="h-4 w-4"/>
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon">
                                                                            <Trash2 className="h-4 w-4"/>
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            {/* Mobile card view - показана только на мобильных */}
                                            <div className="md:hidden space-y-3">
                                                {list.map((e, index) => (
                                                    <div key={index} className="">
                                                        <CardContent className="p-4 space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <div className={`flex gap-2`}>
                                                                    <p className="font-semibold ">{e.error_robot}</p>
                                                                    <p className="text-sm">{e.device_type}</p>
                                                                </div>
                                                                <ButtonGroup>
                                                                    <Button variant="outline" size="sm" className="flex-1">
                                                                        <Trash2 className="h-3 w-3 mr-1"/>
                                                                    </Button>
                                                                </ButtonGroup>
                                                            </div>

                                                            <div className="text-sm flex items-center gap-2">
                                                                <div className="flex justify-between">
                                                                    <span className="font-medium">{dayjs(e.error_start_time).format("HH:mm")}</span>
                                                                </div>
                                                                <MoveRight size={16} />
                                                                <div className="flex justify-between">
                                                                    <span className="font-medium">{dayjs(e.error_end_time).format("HH:mm")}</span>
                                                                </div>
                                                                <Equal  size={16}/>
                                                                <div className="flex justify-between">
                                                                    <span className="font-medium">{e.solving_time} min</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </div>
                </CardContent>
            </div>
        </div>
    );
}