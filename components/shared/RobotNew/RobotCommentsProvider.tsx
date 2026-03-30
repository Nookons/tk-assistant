import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import AddCommentRobot from "@/components/shared/robot/addComment/AddCommentRobot";
import {Separator} from "@/components/ui/separator";
import CommentsList from "@/components/shared/robot/commentsList/CommentsList";
import {IRobot} from "@/types/robot/robot";

const RobotCommentsProvider = ({robot}: {robot: IRobot}) => {
    return (
        <div className={``}>
            <div className="py-3">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Comments
                </div>
            </div>
            <div className="space-y-4">
                <AddCommentRobot robot_data={robot} />
                    <Separator />
                <CommentsList robot_id={robot.id} />
            </div>
        </div>
    );
};

export default RobotCommentsProvider;