'use client'

import React, {useMemo} from 'react'
import {useParams, notFound} from 'next/navigation'
import {useRobotsStore} from '@/store/robotsStore'
import {useUserStore} from '@/store/user'
import {Separator} from '@/components/ui/separator'
import {Skeleton} from '@/components/ui/skeleton'
import RobotHistory from '@/components/shared/robot/changedParts/RobotHistory'
import RobotHeader from "@/components/shared/robot/Header/RobotHeader";
import RobotInfo from "@/components/shared/RobotNew/RobotInfo";
import RobotCommentsProvider from "@/components/shared/RobotNew/RobotCommentsProvider";
import PagesHeader from "@/components/shared/PagesHeader";


function PageSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur px-6 py-3">
                <Skeleton className="h-4 w-16"/>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-xl"/>
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-32"/>
                        <Skeleton className="h-3 w-48"/>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_640px] gap-6">
                    <div className="space-y-4">
                        <Skeleton className="h-40 w-full rounded-lg"/>
                        <Skeleton className="h-64 w-full rounded-lg"/>
                    </div>
                    <div>
                        <Skeleton className="h-96 w-full rounded-lg"/>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default function RobotPage() {
    const params = useParams()
    const robotId = Number(params?.id)

    const robotsList = useRobotsStore(state => state.robots)

    const robot = useMemo(
        () => robotsList?.find(r => r.id === robotId) ?? null,
        [robotsList, robotId],
    )

    if (robotsList === null) return <PageSkeleton/>
    if (!robot) notFound()

    return (
        <div className="min-h-screen bg-background">
            <PagesHeader/>

            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6">
                <RobotHeader robot={robot}/>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-12">
                    <div className="space-y-4">
                        <RobotInfo robot={robot}/>
                        <RobotCommentsProvider robot={robot}/>
                    </div>
                    <Separator className={`md:hidden`} />
                    <div className={`p-2`}>
                        <RobotHistory robot={robot}/>
                    </div>
                </div>
            </div>
        </div>
    )
}