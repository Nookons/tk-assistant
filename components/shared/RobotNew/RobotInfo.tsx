import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import RobotStatusDialog from "@/components/shared/robot/EditStatus/RobotEditStatus";
import {Badge} from "@/components/ui/badge";
import {timeToString} from "@/utils/timeToString";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {Bubbles, Pencil} from "lucide-react";
import {hasProblem} from "@/utils/Robot/hasProblem";
import {IRobot} from "@/types/robot/robot";
import {Button} from "@/components/ui/button";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

const RobotInfo = ({robot}: {robot: IRobot}) => {
    const isProblem = hasProblem({robot})

    return (
        <Card className={`${isProblem ? 'border-destructive/40' : ''} relative group`}>
            <CardHeader className=" pb-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Current Issue
                    </CardTitle>
                </div>
                <div className={`absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition`}>
                    <RobotStatusDialog
                        isEdit={true}
                        currentRobot={robot}
                        actionType={"sendToMaintenance"}
                    />
                </div>
            </CardHeader>
            <CardContent>
                {isProblem ? (
                    <div className="space-y-3">
                        <Badge variant="destructive">{robot.type_problem}</Badge>
                        <p className="text-base font-medium">{robot.problem_note}</p>
                        <p className="text-xs text-muted-foreground">
                            {robot.updated_by?.user_name} · {robot.updated_by?.warehouse} · {timeToString(robot.updated_at)}
                        </p>
                    </div>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon"><Bubbles /></EmptyMedia>
                            <EmptyTitle>No Issue</EmptyTitle>
                            <EmptyDescription>Robot is running without any problems.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </CardContent>
        </Card>
    );
};

export default RobotInfo;