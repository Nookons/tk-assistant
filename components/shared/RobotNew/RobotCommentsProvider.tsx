import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import AddCommentRobot from "@/components/shared/robot/addComment/AddCommentRobot";
import {Separator} from "@/components/ui/separator";
import CommentsList from "@/components/shared/robot/commentsList/CommentsList";
import {IRobot} from "@/types/robot/robot";

const RobotCommentsProvider = ({robot}: {robot: IRobot}) => {
    return (
        <Card className={``}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Comments
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <AddCommentRobot robot_data={robot} />
                <Separator />
                <CommentsList robot_id={robot.id} />
            </CardContent>
        </Card>
    );
};

export default RobotCommentsProvider;