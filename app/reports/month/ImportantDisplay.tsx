import React, {useEffect} from 'react';
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";
import {getNotesMonth} from "@/futures/important/getNotesMonth";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {timeToString} from "@/utils/timeToString";
import {NoteItem} from "@/types/Important/Important";
import {NotebookPen} from "lucide-react";

interface ImportantDisplayProps {
    date: Date | null;
    setImportant_data: (data: NoteItem[]) => void;
}

const ImportantDisplay = ({date, setImportant_data}: ImportantDisplayProps) => {
    // ✅ Хуки — до любых ранних return
    const {data, isLoading, isError} = useQuery({
        queryKey: ['important-month', date],
        queryFn:  () => getNotesMonth(dayjs(date!).format("YYYY-MM")),
        enabled:  !!date, // ✅ вместо if (!date) return null перед хуком
        retry: 3,
    });

    useEffect(() => {
        setImportant_data(data ?? []);
    }, [data]);

    if (!date) return null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <NotebookPen size={14}/>
                        Important Notes
                    </CardTitle>
                    {!isLoading && data && (
                        <Badge variant="secondary" className="text-xs">
                            {data.length} notes
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-2">
                {isLoading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <Skeleton key={i} className="w-full h-16"/>
                    ))
                ) : isError || !data ? (
                    <p className="text-sm text-destructive py-4 text-center">
                        Failed to load notes
                    </p>
                ) : data.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                        No notes for this month
                    </p>
                ) : (
                    data.map((el, i) => (
                        <div
                            key={el.id ?? i}
                            className="rounded-lg border border-border bg-muted/30 p-3 space-y-1"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium">{el.user.user_name}</span>
                                <span className="text-[11px] text-muted-foreground">{timeToString(el.created_at)}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{el.note}</p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default ImportantDisplay;