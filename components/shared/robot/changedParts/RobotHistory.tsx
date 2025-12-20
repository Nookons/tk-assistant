import React, {useEffect, useState} from 'react';
import {IUser} from "@/types/user/user";
import {
    Clock,
    CloudOff,
    Puzzle,
    Activity,
    ArrowBigRight,
    BrushCleaning,
    Combine,
    MoveRight,
    PackageMinus, Trash2
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import dayjs from "dayjs";
import {Badge} from "@/components/ui/badge";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@/components/ui/empty";
import {IRobot} from "@/types/robot/robot";
import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {Button} from "@/components/ui/button";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {removeParts} from "@/futures/robots/remove-parts";
import {useUserStore} from "@/store/user";

interface StatusHistoryItem {
    id: number;
    add_by: number;
    robot_id: number;
    created_at: Timestamp;
    new_status: string;
    old_status: string;
    robot_number: number;
    user: IUser;
    type: 'status';
}

interface PartsHistoryItem {
    id: number;
    card_id: number;
    robot_id: number;
    created_at: Timestamp;
    parts_numbers: string;
    user: IUser;
    type: 'parts';
}

type HistoryEvent = StatusHistoryItem | PartsHistoryItem;

const RobotHistory = ({robot}: { robot: IRobot }) => {
    const [filtered, setFiltered] = useState<HistoryEvent[]>([]);

    const user = useUserStore(state => state.current_user)

    useEffect(() => {
        const statusHistory = robot.status_history?.map(item => ({
            ...item,
            type: 'status' as const
        })) || [];

        const partsHistory = robot.parts_history?.map(item => ({
            ...item,
            type: 'parts' as const
        })) || [];

        const sorted = [...statusHistory, ...partsHistory].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setFiltered(sorted);
        console.log('Sorted history:', sorted);
    }, [robot]);

    const getPartsRemove = async (parts_id: number) => {
        try {
            const res = await removeParts(parts_id.toString())

            if (res) {
                window.location.reload();
            }
        } catch (err) {
            console.log(err);
        }
    }

    if (filtered.length === 0) {
        return (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <CloudOff/>
                    </EmptyMedia>
                    <EmptyTitle>Storage Empty</EmptyTitle>
                    <EmptyDescription>
                        No history yet. When you add parts or change status, you will see it here.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-2">
            <div className="relative border-l-2 border-gray-300">
                {filtered.slice(0, 25).map((event, index) => (
                    <div key={`${event.type}-${event.id}`} className="mb-2 ml-6">
                        <span
                            className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-secondary shadow">
                            {event.type === 'parts' ? (
                                <Combine className="h-4 w-4"/>
                            ) : (
                                <Activity className="h-4 w-4"/>
                            )}
                        </span>

                        <Card className="rounded-2xl shadow p-0">
                            <CardContent className="py-2">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-xs text-neutral-500">
                                        {dayjs(event.created_at).format('HH:mm · MMM D, YYYY')}
                                    </Label>
                                    <div className={`flex items-center gap-2`}>
                                        <Label className="text-xs text-neutral-500">
                                            {event.user?.user_name || 'Unknown User'}
                                        </Label>
                                        {event.type === 'parts' && (
                                            <>
                                                {event.card_id === user?.card_id && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant={`ghost`}><Trash2 /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete your
                                                                    history.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => getPartsRemove(event.id)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {event.type === 'parts' && event.parts_numbers && (
                                    <div className="flex flex-wrap gap-4">
                                        {JSON.parse(event.parts_numbers).map((partNumber: string, idx: number) => (
                                            <Label>
                                                <PackageMinus size={16}/>
                                                <Button variant={`link`} className="text-xs p-0">{partNumber}</Button>
                                            </Label>
                                        ))}
                                    </div>
                                )}

                                {event.type === 'status' && event.new_status && (
                                    <div>
                                        <div className={`flex items-center gap-2`}>
                                            <Label>
                                                <BrushCleaning className={`text-red-500`} size={16}/>
                                                <span className="text-xs">{event.old_status}</span>
                                            </Label>
                                            <MoveRight size={16}/>
                                            <Label>
                                                <Activity className={`text-green-500`} size={16}/>
                                                <span className="text-xs">{event.new_status}</span>
                                            </Label>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RobotHistory;