import React from 'react';
import {Badge} from "@/components/ui/badge";
import {
    Calendar,
    CalendarIcon,
    CheckCircle2Icon,
    ClipboardList,
    Clock,
    Construction,
    ListPlus,
    MapPin,
    Package,
    Pointer,
    SettingsIcon,
    UserIcon
} from "lucide-react";
import {timeToString} from "@/utils/timeToString";
import RobotStatusDialog from "@/components/shared/robot/EditStatus/RobotEditStatus";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {IRobot} from "@/types/robot/robot";
import {isOffline} from "@/utils/Robot/isOffline";
import {RobotImage} from "@/utils/Robot/getRobotImage";
import PartsPicker from "@/components/shared/RobotNew/RobotPartsPicker";
import {Button} from "@/components/ui/button";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import {CardContent} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ScrollArea} from "@/components/ui/scroll-area";
import {toast} from "sonner";
import {getInitialShift, getInitialShiftByTime} from "@/futures/date/getInitialShift";
import {getWorkDate} from "@/futures/date/getWorkDate";
import {useSessionStore} from "@/store/session";
import RepairPdf from "@/components/shared/robot/RepairPdf/RepairPdf";
import RobotActions from "@/components/shared/robot/RobotActions/RobotActions";


const RobotHeader = ({robot}: { robot: IRobot }) => {
    if (!robot || !robot.parts_history) return null;
    const offline = isOffline(robot.status)

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-4">
                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 ${
                        offline
                            ? 'border-destructive/40 bg-destructive/5'
                            : 'border-emerald-500/40 bg-emerald-500/5'
                    }`}
                >
                    <RobotImage type={robot.robot_type} status={robot.status}/>
                </div>

                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {robot.robot_number}
                        </h1>

                        <Badge variant={offline ? "destructive" : "default"} className="text-xs">
                            {offline ? "Offline" : "Online"}
                        </Badge>
                    </div>

                    <div className="flex flex-col md:flex-row items-start gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <MapPin size={11} className="shrink-0"/>
                            {robot.warehouse ?? "—"}
                        </span>

                        <span className="flex items-center gap-1 text-nowrap">
                            <Clock size={11} className="shrink-0"/>
                                {timeToString(robot.updated_at)}
                            </span>

                        {robot.updated_by?.user_name && (
                            <span className="truncate max-w-[120px]">
                                {robot.updated_by.user_name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <RobotActions robot={robot} />
        </div>
    );
};

export default RobotHeader;