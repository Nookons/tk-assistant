import React, { useEffect, useState } from 'react';
import { IUser } from "@/types/user/user";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import dayjs from "dayjs";
import {Label} from "@/components/ui/label";

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
                    <Label className="text-base">{comment.employees?.user_name || "Unknown User"} </Label>
                    <Label className={`text-xs text-muted-foreground`}>{dayjs(comment.created_at).format(`HH:mm · MMM D, YYYY`)}</Label>
                    <Label className="my-4">{comment.body}</Label>
                </div>
            ))}
        </div>
    );
};

export default CommentsList;
