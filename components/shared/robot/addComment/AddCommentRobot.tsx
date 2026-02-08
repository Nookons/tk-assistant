import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IRobot } from "@/types/robot/robot";
import { useUserStore } from "@/store/user";
import { Loader2, Send, X } from "lucide-react";
import { useRobotsStore } from "@/store/robotsStore";
import { toast } from "sonner";

interface AddCommentRobotProps {
    robot_data: IRobot;
    onCommentAdded?: () => void;
}

const AddCommentRobot: React.FC<AddCommentRobotProps> = ({ robot_data, onCommentAdded }) => {
    const [commentValue, setCommentValue] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const user = useUserStore(state => state.currentUser);
    const updateRobot = useRobotsStore(state => state.updateRobot);

    const addComment = async () => {
        if (!user?.card_id) {
            toast.error("You must be logged in to comment");
            return;
        }

        if (!commentValue.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/comments/add-comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    card_id: user.card_id,
                    robot_id: robot_data.id,
                    comment: commentValue.trim()
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            toast.success("Comment added successfully");
            setCommentValue("");
            setIsFocused(false);

            // Update robot store if needed
            updateRobot(robot_data.id, {
                // Add any necessary updates
            });

            // Trigger refresh callback if provided
            if (onCommentAdded) {
                onCommentAdded();
            }

        } catch (e) {
            console.error("Failed to add comment:", e);
            toast.error("Failed to add comment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setCommentValue("");
        setIsFocused(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!isSubmitDisabled) {
                addComment();
            }
        }
    };

    const isSubmitDisabled = isSubmitting || !commentValue.trim();
    const charCount = commentValue.length;
    const maxChars = 1000;
    const isNearLimit = charCount > maxChars * 0.8;

    return (
        <div className="w-full">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Add Comment</Label>
                    {isFocused && (
                        <span className={`text-xs ${isNearLimit ? 'text-orange-500' : 'text-muted-foreground'}`}>
                            {charCount} / {maxChars}
                        </span>
                    )}
                </div>

                <div className={`relative transition-all ${isFocused ? 'rounded-lg' : ''}`}>
                    <Textarea
                        value={commentValue}
                        onChange={(e) => {
                            if (e.target.value.length <= maxChars) {
                                setCommentValue(e.target.value);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        placeholder={`Share your thoughts about ${robot_data.robot_number || 'this robot'}...`}
                        className={`w-full min-h-[40px] resize-none transition-all ${
                            isFocused ? 'min-h-[120px]' : ''
                        }`}
                        disabled={isSubmitting}
                    />
                </div>

                {(isFocused || commentValue) && (
                    <div className="flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
                        <div className="text-xs text-muted-foreground">
                            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border rounded">Enter</kbd> to submit
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleClear}
                                disabled={isSubmitting}
                                variant="outline"
                                size="sm"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                            <Button
                                onClick={addComment}
                                disabled={isSubmitDisabled}
                                size="sm"
                                className="gap-1"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Submit
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddCommentRobot;