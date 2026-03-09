import React from 'react';
import {Badge} from "@/components/ui/badge";
import {CheckCircle2Icon, Clock, MapPin} from "lucide-react";
import {timeToString} from "@/utils/timeToString";
import {ButtonGroup} from "@/components/ui/button-group";
import RobotStatusDialog from "@/components/shared/robot/EditStatus/RobotEditStatus";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {IRobot} from "@/types/robot/robot";
import {isOffline} from "@/utils/Robot/isOffline";
import {RobotImage} from "@/utils/Robot/getRobotImage";
import PartsPicker from "@/components/shared/RobotNew/RobotPartsPicker";


const RobotHeader = ({robot}: {robot: IRobot}) => {
    const offline    = isOffline(robot.status)
    const hasParts   = robot.parts_history ? robot.parts_history.length > 0 : false

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 ${
                        offline
                            ? 'border-destructive/40 bg-destructive/5'
                            : 'border-emerald-500/40 bg-emerald-500/5'
                    }`}
                >
                    <RobotImage type={robot.robot_type} status={robot.status} />
                </div>

                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {robot.robot_number}
                        </h1>
                        <Badge variant={offline ? 'destructive' : 'default'} className="text-xs">
                            {offline ? 'Offline' : 'Online'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <MapPin size={11} /> {robot.warehouse ?? '—'}
                        </span>
                        <span className="flex text-nowrap items-center gap-1">
                            <Clock size={11} /> {timeToString(robot.updated_at)}
                        </span>
                        {robot.updated_by && (
                            <span className={`line-clamp-1`}>{robot.updated_by.user_name}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <ButtonGroup
                className={`w-full md:w-auto col-span-3 grid gap-0 ${hasParts ? 'grid-cols-3' : 'grid-cols-2'}`}
            >
                {offline
                    ? <RobotStatusDialog currentRobot={robot} actionType="sendToMap" />
                    : <RobotStatusDialog currentRobot={robot} actionType="sendToMaintenance" />
                }

                <PartsPicker robot={robot} />
            </ButtonGroup>
            {hasParts &&
                <Alert className="max-w-full">
                    <CheckCircle2Icon />
                    <AlertTitle>Changed parts</AlertTitle>
                    <AlertDescription>
                        <div className={`flex flex-wrap gap-2 items-center`}>
                            <p>Please don't forget to add this parts in list WeCom</p>
                            <Badge>GLP-C Spare Parts Inventory 备件管理</Badge>
                        </div>
                    </AlertDescription>
                </Alert>
            }
        </div>
    );
};

export default RobotHeader;