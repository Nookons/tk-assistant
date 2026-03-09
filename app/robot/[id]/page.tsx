'use client'

import React, { useMemo } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {Bubbles, Wrench} from 'lucide-react'

import { useRobotsStore } from '@/store/robotsStore'
import { useUserStore } from '@/store/user'
import { timeToString } from '@/utils/timeToString'

import { Badge } from '@/components/ui/badge'
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
import RobotStatusDialog from '@/components/shared/robot/EditStatus/RobotEditStatus'
import RobotHeader from "@/components/shared/RobotNew/RobotHeader";
import RobotInfo from "@/components/shared/RobotNew/RobotInfo";
import RobotCommentsProvider from "@/components/shared/RobotNew/RobotCommentsProvider";


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


export default function RobotPage() {
    const params    = useParams()
    const robotId   = Number(params?.id)

    const robotsList = useRobotsStore(state => state.robots)
    const user        = useUserStore(state => state.currentUser)

    const robot = useMemo(
        () => robotsList?.find(r => r.id === robotId) ?? null,
        [robotsList, robotId],
    )


    if (robotsList === null) return <PageSkeleton />
    if (!robot) notFound()

    const hasProblem = robot.type_problem.length > 0

    return (
        <div className="min-h-screen bg-background">

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
                <RobotHeader robot={robot} />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_640px] gap-6">
                    <div className="space-y-4">
                        <RobotInfo robot={robot} />
                        <RobotCommentsProvider robot={robot} />
                    </div>

                    <div className="">
                        <div>
                            <div className="pb-3">
                                <div className="flex items-center justify-end">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Wrench size={14} /> History
                                    </CardTitle>
                                </div>
                            </div>
                            <div>
                                <RobotHistory robot={robot} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}