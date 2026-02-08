import React from 'react';
import {useQuery} from "@tanstack/react-query";
import {getNotesMonth} from "@/futures/important/getNotesMonth";
import {Skeleton} from "@/components/ui/skeleton";
import {ShieldAlert, Terminal} from "lucide-react";
import {timeToString} from "@/utils/timeToString";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import dayjs from "dayjs";

const ImportantScreen = () => {

    const {data, isLoading, isError, error} = useQuery({
        queryKey: ['important_screen'],
        queryFn: () => getNotesMonth(dayjs().format("YYYY-MM")),
        refetchInterval: 10000
    })

    if (isLoading) return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[55px] w-full rounded-xl"/>
        </div>
    )

    if (isError) return (
        <div>
            Error: {error.message}
        </div>
    )

    if (!data) return null;

    if (data.length === 0) return (
        <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
            <EmptyHeader>
                <EmptyDescription>
                    None important notes yet.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    )

    const lastItem = data[data.length - 1];


    return (
        <Alert variant="default">
            <ShieldAlert />

            <AlertTitle>
                <div className={`flex justify-between text-xs w-full`}>
                    <Label>{lastItem.user.user_name}</Label>
                    <p>{timeToString(lastItem.created_at)}</p>
                </div>
            </AlertTitle>
            <AlertDescription>
                <p>{lastItem.note}</p>
            </AlertDescription>
        </Alert>
    );
};

export default ImportantScreen;