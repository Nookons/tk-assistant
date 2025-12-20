import React, { useEffect, useState } from 'react';
import { IUser } from "@/types/user/user";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import dayjs from "dayjs";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Trash2} from "lucide-react";
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

    const user = useUserStore(state => state.current_user)

    const updateRobotStore = useRobotsStore(state => state.updateRobot);

    const getCommentsList = async () => {
        try {
            console.log(robot_id);
            setLoading(true);
            const res = await fetch(`/api/robots/get-comments?robot_id=${robot_id.toString()}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
            });

            const data: IComment[] = await res.json();
            setComments([...data].reverse() as IComment[]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getCommentRemove = async (comment_id: number) => {
        try {
            const res = await removeComment(comment_id.toString())

            if (res) {
                window.location.reload();
            }

        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (robot_id) {
            getCommentsList();
        }
    }, [robot_id]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-2 w-full">
            {comments.length === 0 && <div>No comments yet</div>}
            {comments.slice(0,20).map((comment) => (
                <div key={comment.id} className="p-2 bg-muted rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl w-full">
                    <div className={`flex justify-between gap-2`}>
                        <div>
                            <Label className="text-base">{comment.employees?.user_name || "Unknown User"} </Label>
                            <Label className={`text-xs text-muted-foreground`}>{dayjs(comment.created_at).format(`HH:mm · MMM D, YYYY`)}</Label>
                        </div>
                        {comment.add_by === user?.card_id &&
                            <div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button><Trash2 /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your
                                                comment.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => getCommentRemove(comment.id)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        }
                    </div>
                    <Label className="my-4">{comment.body}</Label>
                </div>
            ))}
        </div>
    );
};

export default CommentsList;
