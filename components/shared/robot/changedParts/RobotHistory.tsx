import React, {useEffect, useState, useRef} from 'react';
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
    PackageMinus, Trash2, Loader, ChevronDown, ChevronUp
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
import {useRobotsStore} from "@/store/robotsStore";

interface StatusHistoryItem {
    id: number;
    add_by: number;
    robot_id: number;
    created_at: Timestamp;
    new_status: string;
    old_status: string;
    robot_number: number;
    type_problem: string | null;
    problem_note: string | null;
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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});

    const user = useUserStore(state => state.current_user);
    const removeFromStock = useRobotsStore(state => state.deletePartsHistory);

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
    }, [robot]);

    const toggleNoteExpansion = (eventId: number) => {
        setExpandedNotes(prev => ({
            ...prev,
            [eventId]: !prev[eventId]
        }));
    };

    const getPartsRemove = async (parts_id: number) => {
        try {
            setIsLoading(true);
            const res = await removeParts(parts_id.toString());

            if (res) {
                removeFromStock(res.robot_id, res.id);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 250);
        }
    };

    if (filtered.length === 0) {
        return (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <CloudOff/>
                    </EmptyMedia>
                    <EmptyTitle>No History Available</EmptyTitle>
                    <EmptyDescription>
                        No history yet. When you add parts or change status, it will appear here.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-2">
            <div className="relative border-l-2 border-gray-300">
                {filtered.slice(0, 25).map((event) => {
                    const isExpanded = expandedNotes[event.id];
                    const hasLongNote = event.type === 'status' && event.problem_note && event.problem_note.length > 150;

                    return (
                        <div key={`${event.type}-${event.id}`} className="mb-2 ml-6">
                            <span
                                className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-secondary shadow">
                                {event.type === 'parts' ? (
                                    <Combine className="h-4 w-4"/>
                                ) : (
                                    <Activity className="h-4 w-4"/>
                                )}
                            </span>

                            <Card className="p-2">
                                <CardContent className="w-full px-2">
                                    <div className="grid grid-cols-2 gap-2 items-center mb-2">
                                        <Label className="text-xs text-neutral-500">
                                            {dayjs(event.created_at).format('HH:mm · MMM D, YYYY')}
                                        </Label>
                                        <div className="flex items-center justify-end gap-2">
                                            <Label className="text-xs line-clamp-1 text-neutral-500">
                                                {event.user?.user_name || 'Unknown User'}
                                            </Label>
                                            {event.type === 'parts' && event.card_id === user?.card_id && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            className="p-1 h-auto"
                                                            disabled={isLoading}
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            {isLoading ? (
                                                                <Loader className="animate-spin h-4 w-4"/>
                                                            ) : (
                                                                <Trash2 className="h-4 w-4"/>
                                                            )}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Parts History?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete this parts history entry from the robot's records.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => getPartsRemove(event.id)}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>

                                    {event.type === 'parts' && event.parts_numbers && (
                                        <div className="flex flex-wrap gap-2">
                                            {JSON.parse(event.parts_numbers).map((partNumber: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                                                    <PackageMinus size={14}/>
                                                    <span className="text-xs">{partNumber}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {event.type === 'status' && event.new_status && (
                                        <div className="grid gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <BrushCleaning className="text-red-500" size={16}/>
                                                    <span className="text-xs">{event.old_status}</span>
                                                </div>
                                                <MoveRight size={16} className="text-neutral-400"/>
                                                <div className="flex items-center gap-1">
                                                    <Activity className="text-green-500" size={16}/>
                                                    <span className="text-xs">{event.new_status}</span>
                                                </div>
                                            </div>

                                            {(event.type_problem || event.problem_note) && (
                                                <div className="flex flex-col gap-2">
                                                    {event.type_problem && (
                                                        <Badge variant="secondary" className="text-xs w-fit">
                                                            {event.type_problem}
                                                        </Badge>
                                                    )}

                                                    {event.problem_note && (
                                                        <div className="space-y-2">
                                                            <div
                                                                className="text-sm text-neutral-700 whitespace-pre-wrap overflow-hidden transition-all duration-200"
                                                                style={{
                                                                    maxHeight: isExpanded ? '1000px' : '4.5em',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: isExpanded ? 'unset' : 1,
                                                                    WebkitBoxOrient: 'vertical'
                                                                }}
                                                            >
                                                                {event.problem_note}
                                                            </div>
                                                            {hasLongNote && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() => toggleNoteExpansion(event.id)}
                                                                    className="h-auto p-1 text-xs text-primary hover:text-primary/80"
                                                                >
                                                                    {isExpanded ? (
                                                                        <>
                                                                            <ChevronUp className="h-3 w-3 mr-1"/>
                                                                            Show less
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ChevronDown className="h-3 w-3 mr-1"/>
                                                                            Show more
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RobotHistory;