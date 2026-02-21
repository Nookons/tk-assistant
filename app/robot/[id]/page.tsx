'use client'
import React, {useMemo} from 'react';
import {useParams} from "next/navigation";
import {useRobotsStore} from "@/store/robotsStore";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ButtonGroup} from "@/components/ui/button-group";
import {Separator} from "@/components/ui/separator";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
    Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem,
    BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import Image from "next/image";
import Link from "next/link";
import {Bubbles, Clock, MapPin, Wrench} from "lucide-react";

import RobotHistory from "@/components/shared/robot/changedParts/RobotHistory";
import PartsPicker from "@/components/shared/robot/addNewParts/partsPicker";
import AddCommentRobot from "@/components/shared/robot/addComment/AddCommentRobot";
import CommentsList from "@/components/shared/robot/commentsList/CommentsList";
import PartCopy from "@/components/shared/dashboard/PartCopy/PartCopy";
import RobotGraph from "@/components/shared/robot/robotGraph/RobotGraph";
import RobotStatusDialog from "@/components/shared/robot/EditStatus/RobotEditStatus";
import {timeToString} from "@/utils/timeToString";
import {useUserStore} from "@/store/user";

// ── Helpers ───────────────────────────────────────────────────────────────────

const isOffline = (status: string) => status === "离线 | Offline";

function RobotImage({type, status}: { type: string; status: string }) {
    const offline = isOffline(status);
    const src = type === "K50H"
        ? (offline ? "/img/K50H_red.svg" : "/img/K50H_green.svg")
        : (offline ? "/img/A42T_red.svg" : "/img/A42T_Green.svg");
    return <Image src={src} alt="robot" width={36} height={36}/>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

const Page = () => {
    const params   = useParams();
    const robot_id = params?.id;
    const user = useUserStore(state => state.currentUser)
    const robots_list = useRobotsStore(state => state.robots);

    // useMemo вместо useEffect + useState
    const current_Robot = useMemo(() => {
        if (!robots_list) return null;
        return robots_list.find(item => item.id === Number(robot_id)) ?? null;
    }, [robots_list, robot_id]);

    if (!current_Robot) return null;

    const offline      = isOffline(current_Robot.status);
    const hasProblem   = current_Robot.type_problem.length > 0;
    const hasParts     = current_Robot.parts_history.length > 0;

    return (
        <div className="min-h-screen bg-background">

            {/* ── Top bar ── */}
            <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur px-6 py-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbSeparator className={`rotate-180 text-foreground font-bold`}/>
                        <BreadcrumbItem>
                            <BreadcrumbLink>
                                <Link className={`text-foreground font-bold`} href={`/dashboard/${user?.auth_id || ""}`}>Back</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6">

                {/* ── Hero header ── */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 ${offline ? "border-destructive/40 bg-destructive/5" : "border-emerald-500/40 bg-emerald-500/5"}`}>
                            <RobotImage type={current_Robot.robot_type} status={current_Robot.status}/>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {current_Robot.robot_number}
                                </h1>
                                <Badge variant={offline ? "destructive" : "default"} className="text-xs">
                                    {offline ? "Offline" : "Online"}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <MapPin size={11}/> {current_Robot.warehouse ?? "—"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={11}/> {timeToString(current_Robot.updated_at)}
                                </span>
                                {current_Robot.updated_by && (
                                    <span>{current_Robot.updated_by.user_name}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <ButtonGroup className={`grid gap-0 ${hasParts ? "grid-cols-3" : "grid-cols-2"}`}>
                        {offline
                            ? <RobotStatusDialog currentRobot={current_Robot} actionType="sendToMap"/>
                            : <RobotStatusDialog currentRobot={current_Robot} actionType="sendToMaintenance"/>
                        }
                        <PartsPicker robot={current_Robot}/>
                        {hasParts && <PartCopy robot={current_Robot}/>}
                    </ButtonGroup>
                </div>

                {/* ── Main grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_640px] gap-6">
                    <div className="space-y-4">

                        <Card className={hasProblem ? "border-destructive/40" : ""}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        Current Issue
                                    </CardTitle>
                                    {hasProblem && (
                                        <RobotStatusDialog currentRobot={current_Robot} actionType="edit"/>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {hasProblem ? (
                                    <div className="space-y-3">
                                        <Badge variant="destructive">{current_Robot.type_problem}</Badge>
                                        <p className="text-base font-medium">{current_Robot.problem_note}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {current_Robot.updated_by?.user_name} · {current_Robot.updated_by?.warehouse} · {timeToString(current_Robot.updated_at)}
                                        </p>
                                    </div>
                                ) : (
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <Bubbles/>
                                            </EmptyMedia>
                                            <EmptyTitle>No Issue</EmptyTitle>
                                            <EmptyDescription>
                                                Robot is running without any problems.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    Comments
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <AddCommentRobot robot_data={current_Robot}/>
                                <Separator/>
                                <CommentsList robot_id={current_Robot.id}/>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Wrench size={14}/> Parts History
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs">
                                        {current_Robot.parts_history.length} records
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <RobotHistory robot={current_Robot}/>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;