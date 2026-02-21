import React, {useEffect, useMemo, useState} from 'react';
import {useRobotsStore} from "@/store/robotsStore";
import dayjs from "dayjs";
import {useStockStore} from "@/store/stock";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {timeToString} from "@/utils/timeToString";
import {Wrench} from "lucide-react";
import {IMonthParts} from "@/app/reports/month/page";

interface ChangedPartsDisplayProps {
    date: Date | null;
    setChanged_parts_data: (data: IMonthParts[]) => void;
}

const ChangedPartsDisplay = ({date, setChanged_parts_data}: ChangedPartsDisplayProps) => {
    const robots_store          = useRobotsStore(state => state.robots);
    const parts_templates_store = useStockStore(state => state.items_templates);

    const [page,        setPage]        = useState<number>(1);
    const [items_count, setItems_count] = useState<number>(10);

    const month_parts = useMemo<IMonthParts[]>(() => {
        if (!robots_store || !date) return [];

        const result: IMonthParts[] = [];
        const targetMonth = dayjs(date).format("YYYY-MM");

        for (const robot of robots_store) {
            for (const part of robot.parts_history) {
                if (dayjs(part.created_at).format("YYYY-MM") !== targetMonth) continue;

                let changed_parts: string[] = [];
                try {
                    changed_parts = JSON.parse(part.parts_numbers);
                } catch {
                    continue;
                }

                if (!changed_parts?.length) continue;

                for (const solo_part of changed_parts) {
                    const template = parts_templates_store?.find(t => t.material_number === solo_part);
                    result.push({
                        ...part,
                        parts_numbers:    solo_part,
                        part_description: template?.description_eng ?? "—",
                    });
                }
            }
        }

        return result;
    }, [robots_store, parts_templates_store, date]);

    // Сбрасываем страницу при смене месяца
    useEffect(() => { setPage(1); }, [date]);

    // Синхронизируем полный массив с родителем (не нарезанный!)
    useEffect(() => {
        setChanged_parts_data(month_parts);
    }, [month_parts]);

    const max_page  = Math.max(1, Math.ceil(month_parts.length / items_count));
    const page_data = month_parts.slice((page - 1) * items_count, page * items_count);

    if (!date) return null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Wrench size={14}/>
                        Parts
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                            {month_parts.length} total
                        </Badge>

                        {/* Rows per page */}
                        <Select
                            value={String(items_count)}
                            onValueChange={(v) => { setItems_count(Number(v)); setPage(1); }}
                        >
                            <SelectTrigger className="h-7 w-16 text-xs">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent align="end">
                                <SelectGroup>
                                    {[10, 25, 50, 100].map(n => (
                                        <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Top pagination */}
                        {max_page > 1 && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline" size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    ←
                                </Button>
                                <span className="text-xs text-muted-foreground px-1 tabular-nums">
                                    {page} / {max_page}
                                </span>
                                <Button
                                    variant="outline" size="sm"
                                    className="h-7 w-7 p-0"
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

            <CardContent className="space-y-2">
                {month_parts.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                        No parts changed this month
                    </p>
                ) : (
                    <>
                        {page_data.map((part, index) => (
                            <div
                                key={`${part.id}-${index}`}
                                className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
                            >
                                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                    <span>{part.user.user_name}</span>
                                    <span>{timeToString(part.created_at)}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="font-mono text-sm font-semibold">
                                        {part.parts_numbers}
                                    </span>
                                    <span className="text-sm text-muted-foreground flex-1 min-w-0 truncate">
                                        {part.part_description}
                                    </span>
                                    <Badge variant="outline" className="text-xs shrink-0">
                                        {part.robot.robot_number} · {part.robot.robot_type}
                                    </Badge>
                                </div>
                            </div>
                        ))}

                        {/* Bottom pagination — удобно при длинном списке */}
                        {max_page > 1 && (
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {(page - 1) * items_count + 1}–{Math.min(page * items_count, month_parts.length)} of {month_parts.length}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        ← Prev
                                    </Button>
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => setPage(p => Math.min(max_page, p + 1))}
                                        disabled={page === max_page}
                                    >
                                        Next →
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ChangedPartsDisplay;