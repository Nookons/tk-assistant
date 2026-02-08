import React, {useEffect} from 'react';
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";
import {getNotesMonth} from "@/futures/important/getNotesMonth";
import {Card, CardContent, CardTitle} from "@/components/ui/card";
import {timeToString} from "@/utils/timeToString";
import {NoteItem} from "@/types/Important/Important";


const ImportantDisplay = ({date, setImportant_data}: {date: Date | null, setImportant_data: (data: NoteItem[]) => void}) => {
    if (!date) return null;

    const {data, isLoading, isError} = useQuery({
        queryKey: ['important-month', date],
        queryFn: () => getNotesMonth(dayjs(date).format("YYYY-MM")),
        retry: 3
    })

    useEffect(() => {
        setImportant_data([])

        if (data) {
            setImportant_data(data)
        }
    }, [data]);

    if (isLoading) return <div>Loading...</div>;
    if (!data) return <div>Error: {isError ? "Failed to fetch data" : "Unknown error"}</div>;

    return (
        <div className={`mt-4 w-full flex flex-col gap-2`}>
            <article>Important Notes:</article>
            {data.map(el => (
                <Card className={`p-4`}>
                    <CardTitle className={`flex justify-between`}>
                        <p className={`text-xs text-muted-foreground`}>{el.user.user_name}</p>
                        <p className={`text-xs text-muted-foreground`}>{timeToString(el.created_at)}</p>
                    </CardTitle>
                    <CardContent className={`p-0`}>
                        {el.note}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ImportantDisplay;