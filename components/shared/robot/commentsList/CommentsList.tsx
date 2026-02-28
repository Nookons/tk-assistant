import React, {useEffect, useState} from 'react';
import {IUser} from "@/types/user/user";
import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Heart, Loader, MessageSquare, Pencil, Trash2, ChevronDown, ChevronUp} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Textarea} from "@/components/ui/textarea";
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
import UserAvatar from "@/components/shared/User/UserAvatar";

dayjs.extend(relativeTime);

interface IComment {
    id: number;
    created_at: Timestamp;
    updated_at: Timestamp;
    body: string;
    robot_record: number;
    add_by: number;
    parent_id?: number | null;
    employees: IUser;
    likes?: number;
    liked_by_user?: boolean;
    replies?: IComment[];
}

interface CommentItemProps {
    comment: IComment;
    onReply: (commentId: number, userName: string) => void;
    onEdit: (comment: IComment) => void;
    onDelete: (commentId: number) => void;
    onLike: (commentId: number) => void;
    deletingId: number | null;
    replyingTo: number | null;
    replyText: string;
    setReplyText: (text: string) => void;
    submitReply: (parentId: number) => void;
    isSubmittingReply: boolean;
    cancelReply: () => void;
    depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
                                                     comment,
                                                     onReply,
                                                     onEdit,
                                                     onDelete,
                                                     onLike,
                                                     deletingId,
                                                     replyingTo,
                                                     replyText,
                                                     setReplyText,
                                                     submitReply,
                                                     isSubmittingReply,
                                                     cancelReply,
                                                     depth = 0
                                                 }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const MAX_LENGTH = 125; // Максимальная длина до обрезки
    const isLong = comment.body.length > MAX_LENGTH;

    const user = useUserStore(state => state.currentUser);
    const isOwner = comment.add_by === user?.card_id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isNested = depth > 0;
    const marginLeft = depth * 12;
    const isRoot = depth === 0;

    return (
        <div style={{ marginLeft: `${marginLeft}px` }} className={`${isNested ? 'mt-2' : ''}`}>
            <div className={`p-4 border-l-2 relative ${isRoot ? 'border-primary' : 'border-green-500'}`}>
                <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <UserAvatar user={comment.employees} />
                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold">
                                {comment.employees?.user_name || "Unknown User"}
                            </Label>
                            <Label className="text-xs text-muted-foreground">
                                {dayjs(comment.created_at).fromNow()}
                            </Label>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                className={`h-8 px-2 gap-1 ${comment.liked_by_user ? 'text-red-500' : ''}`}
                                onClick={() => onLike(comment.id)}
                            >
                                <Heart className={`h-4 w-4 ${comment.liked_by_user ? 'fill-current' : ''}`} />
                                {comment.likes !== undefined && comment.likes > 0 && (
                                    <span className="text-xs">{comment.likes}</span>
                                )}
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 gap-1"
                                onClick={() => onReply(comment.id, comment.employees?.user_name || "User")}
                            >
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-1">
                            {isOwner && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={() => onEdit(comment)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
                                                    This action cannot be undone. This will permanently delete your comment.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDelete(comment.id)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Текст комментария с разворачиванием */}
                <p className={`text-sm ${!expanded && "line-clamp-2"} text-foreground whitespace-pre-wrap wrap-break-word mb-1`}>
                    {isLong && !expanded
                        ? comment.body.slice(0, MAX_LENGTH) + "..."
                        : comment.body}
                </p>
                {isLong && (
                    <Button
                        size="sm"
                        variant="link"
                        className="h-auto p-0 text-xs mb-3"
                        onClick={() => setExpanded(prev => !prev)}
                    >
                        {expanded ? "Show less" : "Show more"}
                    </Button>
                )}
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
                <div className="mt-2 p-1 rounded-lg">
                    <Label className="text-sm mb-2 block">Reply to {comment.employees?.user_name}</Label>
                    <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="mb-2"
                        disabled={isSubmittingReply}
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => submitReply(comment.id)}
                            disabled={isSubmittingReply || !replyText.trim()}
                        >
                            {isSubmittingReply && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Reply
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelReply}
                            disabled={isSubmittingReply}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Replies */}
            {hasReplies && (
                <div className="mt-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => setShowReplies(!showReplies)}
                    >
                        {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {showReplies ? 'Hide' : 'Show'} ({comment.replies!.length}) {comment.replies!.length === 1 ? 'reply' : 'replies'}
                    </Button>

                    {showReplies && (
                        <div className="space-y-2 mt-2">
                            {comment.replies!.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onLike={onLike}
                                    deletingId={deletingId}
                                    replyingTo={replyingTo}
                                    replyText={replyText}
                                    setReplyText={setReplyText}
                                    submitReply={submitReply}
                                    isSubmittingReply={isSubmittingReply}
                                    cancelReply={cancelReply}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const CommentsList = ({robot_id}: { robot_id: number }) => {
    const [comments, setComments] = useState<IComment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<string>("");
    const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
    const [editingComment, setEditingComment] = useState<IComment | null>(null);
    const [editText, setEditText] = useState<string>("");
    const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

    const user = useUserStore(state => state.currentUser);
    const updateRobotStore = useRobotsStore(state => state.updateRobot);

    const getCommentsList = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/comments/get-comments?robot_id=${robot_id.toString()}&card_id=${user?.card_id || ''}`, {
                method: 'GET',
                headers: {"Content-Type": "application/json"},
            });

            if (!res.ok) {
                throw new Error('Failed to fetch comments');
            }

            const data: IComment[] = await res.json();

            // Organize comments into threads
            const commentMap = new Map<number, IComment>();
            const rootComments: IComment[] = [];

            data.forEach(comment => {
                commentMap.set(comment.id, {...comment, replies: []});
            });

            data.forEach(comment => {
                const commentWithReplies = commentMap.get(comment.id)!;
                if (comment.parent_id) {
                    const parent = commentMap.get(comment.parent_id);
                    if (parent) {
                        parent.replies!.push(commentWithReplies);
                    }
                } else {
                    rootComments.push(commentWithReplies);
                }
            });

            const sortByDate = rootComments.sort((a, b) =>
                dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
            );

            setComments(sortByDate);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (commentId: number) => {
        try {
            if (!user) throw new Error('user not logged in');

            const res = await fetch(`/api/comments/like-comment`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    comment_id: commentId,
                    card_id: user.card_id
                })
            });

            if (!res.ok) throw new Error('Failed to like comment');

            const {liked, likes} = await res.json();

            // Update comment in state
            const updateCommentLike = (comments: IComment[]): IComment[] => {
                return comments.map(comment => {
                    if (comment.id === commentId) {
                        return {...comment, liked_by_user: liked, likes};
                    }
                    if (comment.replies) {
                        return {...comment, replies: updateCommentLike(comment.replies)};
                    }
                    return comment;
                });
            };

            setComments(updateCommentLike(comments));
        } catch (err) {
            console.error(err);
            toast.error("Failed to like comment");
        }
    };

    const handleReply = (commentId: number, userName: string) => {
        setReplyingTo(commentId);
        setReplyText("");
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setReplyText("");
    };

    const submitReply = async (parentId: number) => {
        if (!user?.card_id || !replyText.trim()) return;

        setIsSubmittingReply(true);

        try {
            const res = await fetch(`/api/comments/add-comment`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    card_id: user.card_id,
                    robot_id: robot_id,
                    comment: replyText,
                    parent_id: parentId
                }),
            });

            if (!res.ok) throw new Error('Failed to add reply');

            toast.success("Reply added successfully");
            setReplyText("");
            setReplyingTo(null);
            await getCommentsList();
        } catch (e) {
            console.error(e);
            toast.error("Failed to add reply");
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleEdit = (comment: IComment) => {
        setEditingComment(comment);
        setEditText(comment.body);
    };

    const submitEdit = async () => {
        if (!editingComment || !editText.trim()) return;

        setIsSubmittingEdit(true);
        try {
            const res = await fetch(`/api/comments/edit-comment`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    comment_id: editingComment.id,
                    comment: editText,
                    user_id: user?.card_id
                }),
            });

            if (!res.ok) throw new Error('Failed to edit comment');

            toast.success("Comment updated successfully");
            setEditText("");
            setEditingComment(null);
            await getCommentsList();
        } catch (e) {
            console.error(e);
            toast.error("Failed to edit comment");
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    const handleDelete = async (comment_id: number) => {
        try {
            setDeletingId(comment_id);
            const res = await removeComment(comment_id.toString());

            if (res) {
                toast.success("Comment deleted successfully");
                await getCommentsList();
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
                <Loader className="animate-spin h-6 w-6 text-muted-foreground"/>
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <MessageSquare/>
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
        <div className="space-y-4 w-full">
            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onLike={handleLike}
                    deletingId={deletingId}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    submitReply={submitReply}
                    isSubmittingReply={isSubmittingReply}
                    cancelReply={cancelReply}
                />
            ))}

            {editingComment && (
                <AlertDialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Edit Comment</AlertDialogTitle>
                            <AlertDialogDescription>
                                Make changes to your comment below.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-[100px]"
                            disabled={isSubmittingEdit}
                        />
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmittingEdit}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={submitEdit}
                                disabled={isSubmittingEdit || !editText.trim()}
                            >
                                {isSubmittingEdit && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                                Save Changes
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
};

export default CommentsList;