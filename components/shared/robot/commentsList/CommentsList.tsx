import React, { useEffect, useState } from 'react';
import { IUser } from "@/types/user/user";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import dayjs from "dayjs";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Loader, MessageSquare, Trash2} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {removeComment} from "@/futures/robots/removeComment";
import {useRobotsStore} from "@/store/robotsStore";
import {useUserStore} from "@/store/user";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@/components/ui/empty";
import {toast} from "sonner";

interface IComment {
    id: number;
    created_at: Timestamp;
    updated_at: Timestamp;
    body: string;
    robot_record: number;
    add_by: number;
    employees: IUser;
}

const CommentsList = ({ robot_id }: { robot_id: number }) => {
    const [comments, setComments] = useState<IComment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const user = useUserStore(state => state.current_user);
    const updateRobotStore = useRobotsStore(state => state.updateRobot);

    const getCommentsList = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/robots/get-comments?robot_id=${robot_id.toString()}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch comments');
            }

            const data: IComment[] = await res.json();

            const sortByDate = data.sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());
            setComments(sortByDate);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    const getCommentRemove = async (comment_id: number) => {
        try {
            setDeletingId(comment_id);
            const res = await removeComment(comment_id.toString());

            if (res) {
                setComments(prev => prev.filter(comment => comment.id !== comment_id));
                toast.success("Comment deleted successfully");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete comment");
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        if (robot_id) {
            getCommentsList();
        }
    }, [robot_id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <MessageSquare />
                    </EmptyMedia>
                    <EmptyTitle>No Comments Yet</EmptyTitle>
                    <EmptyDescription>
                        Be the first to add a comment about this robot.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="space-y-3 w-full">
            {comments.slice(0, 20).map((comment) => (
                <div
                    key={comment.id}
                    className="p-3 bg-muted rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-sm border border-border/50"
                >
                    <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium">
                                {comment.employees?.user_name || "Unknown User"}
                            </Label>
                            <Label className="text-xs text-muted-foreground">
                                {dayjs(comment.created_at).format('HH:mm · MMM D, YYYY')}
                            </Label>
                        </div>
                        {comment.add_by === user?.card_id && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled={deletingId === comment.id}
                                    >
                                        {deletingId === comment.id ? (
                                            <Loader className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your comment from this robot's records.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => getCommentRemove(comment.id)}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {comment.body}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default CommentsList;