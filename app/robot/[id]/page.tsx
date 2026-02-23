'use client'

import React, { useMemo } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Bubbles, Clock, MapPin, Wrench } from 'lucide-react'

import { useRobotsStore } from '@/store/robotsStore'
import { useUserStore } from '@/store/user'
import { timeToString } from '@/utils/timeToString'

import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Breadcrumb, BreadcrumbItem,
    BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
    Empty, EmptyDescription, EmptyHeader,
    EmptyMedia, EmptyTitle,
} from '@/components/ui/empty'

import RobotHistory from '@/components/shared/robot/changedParts/RobotHistory'
import AddCommentRobot from '@/components/shared/robot/addComment/AddCommentRobot'
import CommentsList from '@/components/shared/robot/commentsList/CommentsList'
import PartCopy from '@/components/shared/dashboard/PartCopy/PartCopy'
import RobotStatusDialog from '@/components/shared/robot/EditStatus/RobotEditStatus'
import PartsPicker from "@/components/shared/robot/addNewParts/PartsPicker";

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

const isOffline = (status: string) => status === '离线 | Offline'

function RobotImage({ type, status }: { type: string; status: string }) {
    const offline = isOffline(status)
    const src =
        type === 'K50H'
            ? offline ? '/img/K50H_red.svg' : '/img/K50H_green.svg'
            : offline ? '/img/A42T_red.svg' : '/img/A42T_Green.svg'
    return <Image src={src} alt="robot" width={36} height={36} priority />
}

// ─────────────────────────────────────────────────────────
// Skeleton — renders instantly while store hydrates
// ─────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            {/* Top bar */}
            <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur px-6 py-3">
                <Skeleton className="h-4 w-16" />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6">
                {/* Hero */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_640px] gap-6">
                    <div className="space-y-4">
                        <Skeleton className="h-40 w-full rounded-lg" />
                        <Skeleton className="h-64 w-full rounded-lg" />
                    </div>
                    <div>
                        <Skeleton className="h-96 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

export default function RobotPage() {
    const params    = useParams()
    const robotId   = Number(params?.id)

    const robotsList  = useRobotsStore(state => state.robots)
    const user        = useUserStore(state => state.currentUser)

    const robot = useMemo(
        () => robotsList?.find(r => r.id === robotId) ?? null,
        [robotsList, robotId],
    )

    // Store not yet hydrated — show skeleton immediately
    if (!robotsList) return <PageSkeleton />

    // Store is ready but robot doesn't exist → 404
    if (!robot) notFound()

    const offline    = isOffline(robot.status)
    const hasProblem = robot.type_problem.length > 0
    const hasParts   = robot.parts_history.length > 0

    return (
        <div className="min-h-screen bg-background">

            {/* ── Top bar ── */}
            <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur px-6 py-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbSeparator className="rotate-180 text-foreground font-bold" />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link
                                    className="text-foreground font-bold"
                                    href={`/dashboard/${user?.auth_id ?? ''}`}
                                >
                                    Back
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6">

                {/* ── Hero header ── */}
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
                            <div className="flex items-center gap-2">
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
                                <span className="flex items-center gap-1">
                  <Clock size={11} /> {timeToString(robot.updated_at)}
                </span>
                                {robot.updated_by && (
                                    <span>{robot.updated_by.user_name}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <ButtonGroup
                        className={`grid gap-0 ${hasParts ? 'grid-cols-3' : 'grid-cols-2'}`}
                    >
                        {offline
                            ? <RobotStatusDialog currentRobot={robot} actionType="sendToMap" />
                            : <RobotStatusDialog currentRobot={robot} actionType="sendToMaintenance" />
                        }
                        <PartsPicker robot={robot} />
                        {hasParts && <PartCopy robot={robot} />}
                    </ButtonGroup>
                </div>

                {/* ── Main grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_640px] gap-6">

                    {/* Left column */}
                    <div className="space-y-4">

                        {/* Current issue */}
                        <Card className={hasProblem ? 'border-destructive/40' : ''}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        Current Issue
                                    </CardTitle>
                                    {hasProblem && (
                                        <RobotStatusDialog currentRobot={robot} actionType="edit" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {hasProblem ? (
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

                        {/* Comments */}
                        <Card>
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
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Wrench size={14} /> Parts History
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs">
                                        {robot.parts_history.length} records
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <RobotHistory robot={robot} />
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    )
}