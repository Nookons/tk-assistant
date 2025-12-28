'use client';

import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { getWorkDate } from '@/futures/Date/getWorkDate';
import { getInitialShift } from '@/futures/Date/getInitialShift';
import { getShiftList } from '@/futures/exception/getShiftList';
import {ErrorRecord, generateShiftReport} from '@/futures/PDF/shiftReport';
import { useRobotsStore } from '@/store/robotsStore';
import { toast } from 'sonner';
import dayjs from 'dayjs';

import type { IHistoryParts, IHistoryStatus } from '@/types/robot/robot';

export default function Page() {
    /* ------------------------- state ------------------------- */
    const [date, setDate] = useState<Date | undefined>(getWorkDate(new Date()));
    const [shift, setShift] = useState<'day' | 'night'>(getInitialShift());

    const [data, setData] = useState<Record<string, ErrorRecord[]>>({});
    const [loading, setLoading] = useState(false);

    /* ------------------------- robots store ------------------------- */
    const robots = useRobotsStore((s) => s.robots);

    /* ------------------------- history for selected date & shift ------------------------- */
    const { historyStatus, historyParts } = useMemo(() => {
        if (!date || !robots) return { historyStatus: [], historyParts: [] };

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

        const hs: IHistoryStatus[] = [];
        const hp: IHistoryParts[] = [];

        robots.forEach((r) => {
            // Фильтруем status_history по времени смены
            r.status_history
                .filter((h) => {
                    const createdAt = dayjs(h.created_at);
                    return createdAt.isAfter(shiftStart) && createdAt.isBefore(shiftEnd);
                })
                .forEach((h) => hs.push(h));

            // Фильтруем parts_history по времени смены
            r.parts_history
                .filter((h) => {
                    const createdAt = dayjs(h.created_at);
                    return createdAt.isAfter(shiftStart) && createdAt.isBefore(shiftEnd);
                })
                .forEach((h) => hp.push(h));
        });

        return { historyStatus: hs, historyParts: hp };
    }, [robots, date, shift]);

    /* ------------------------- load exceptions ------------------------- */
    const loadExceptions = async () => {
        if (!date) return;
        setLoading(true);
        try {
            const list = await getShiftList({ date, shift_type: shift });
            const grp: Record<string, ErrorRecord[]> = {};
            list.forEach((e: any) => (grp[e.employee] = [...(grp[e.employee] || []), e]));
            setData(grp);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExceptions();
    }, [date, shift]);

    /* ------------------------- PDF ------------------------- */
    const handlePdf = async () => {
        if (!date) return;
        try {
            setLoading(true);
            // Правильный вызов с новым форматом данных
            await generateShiftReport({
                report_data: data, // Передаем объект Record<string, Exc[]>
                date,
                shift,
                history_status: historyStatus,
                history_parts: historyParts,
            });
            toast.success('PDF report generated successfully!');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    /* ------------------------- UI ------------------------- */
    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
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
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                            </PopoverContent>
                        </Popover>

                        {/* SHIFT */}
                        <Select value={shift} onValueChange={(v) => setShift(v as 'day' | 'night')}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
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
            {loading && !Object.keys(data).length && (
                <Card>
                    <CardContent className="pt-6">Loading…</CardContent>
                </Card>
            )}

            {!loading && !Object.keys(data).length && (
                <Card>
                    <CardContent className="pt-6 text-sm text-muted-foreground">No errors for selected shift.</CardContent>
                </Card>
            )}

            <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                    {Object.entries(data).map(([emp, list]) => (
                        <Card key={emp}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{emp}</CardTitle>
                                    <Badge variant="secondary">
                                        {list.length} error{list.length > 1 ? 's' : ''} · {list.reduce((s, e) => s + e.solving_time, 0)} min
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <Accordion type="single" collapsible>
                                    {list.map((e) => (
                                        <AccordionItem value={String(e.id)} key={e.id}>
                                            <AccordionTrigger className="text-sm">
                                                <div className="flex items-center gap-3">
                                                    <span>{dayjs(e.error_start_time).format('HH:mm')}</span>
                                                    <span className="font-medium">Robot {e.error_robot}</span>
                                                    <span className="text-muted-foreground">{e.device_type}</span>
                                                    <Badge variant="outline">{e.solving_time} min</Badge>
                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent className="text-sm space-y-2">
                                                <div>Issue: {e.issue_description}</div>
                                                <div>Recovery: {e.recovery_title}</div>
                                                <div className="text-xs text-muted-foreground">{e.first_column} · {e.second_column}</div>
                                                <Separator />
                                                <div className="text-xs text-muted-foreground">{e.error_start_time} → {e.error_end_time}</div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}