'use client'

import React, { useEffect, useState, useCallback } from 'react'
import dayjs from 'dayjs'
import {
    Activity,
    ChevronDown,
    ChevronUp,
    CloudOff,
    ClipboardList,
    Loader,
    MapPin,
    MoveRight,
    PackageMinus,
    Hash
} from 'lucide-react'

import { toast } from 'sonner'

import { IUser } from '@/types/user/user'
import { IRobot } from '@/types/robot/robot'
import { IStockItemTemplate } from '@/types/stock/StockItem'
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types'

import { removeParts } from '@/futures/robots/removeParts'
import { getPartByNumber } from '@/futures/stock/getPartByNumber'
import { useUserStore } from '@/store/user'
import { useRobotsStore } from '@/store/robotsStore'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from '@/components/ui/empty'

import { timeToString } from "@/utils/timeToString"
import { RobotHistoryIcon } from "@/utils/RobotHistoryIcon"

interface StatusHistoryItem {
    id: number
    add_by: number
    robot_id: number
    created_at: Timestamp
    new_status: string
    old_status: string
    robot_number: number
    type_problem: string | null
    problem_note: string | null
    user: IUser
    type: 'status'
}

interface PartsHistoryItem {
    id: number
    card_id: number
    robot_id: number
    created_at: Timestamp
    parts_numbers: string
    user: IUser
    parts: IStockItemTemplate[]
    warehouse?: string | null
    quantity?: number | null
    type: 'parts'
}

type HistoryEvent = StatusHistoryItem | PartsHistoryItem

const NOTE_CLAMP_THRESHOLD = 150

function HistoryCardSkeleton() {
    return (
        <div className="mb-2 ml-6">
            <Skeleton className="absolute -left-3 h-6 w-6 rounded-full" />
            <Card className="p-2">
                <CardContent className="px-2 space-y-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </CardContent>
            </Card>
        </div>
    )
}

const RobotHistory = ({ robot }: { robot: IRobot }) => {

    const [events, setEvents] = useState<HistoryEvent[]>([])
    const [loading, setLoading] = useState(true)

    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

    const user = useUserStore(state => state.currentUser)
    const removeFromStock = useRobotsStore(state => state.deletePartsHistory)

    const buildHistory = useCallback(async (signal: AbortSignal) => {

        setLoading(true)

        try {

            const statusEvents: StatusHistoryItem[] =
                (robot.status_history ?? []).map(item => ({
                    ...item,
                    type: 'status'
                }))

            const partsEvents: PartsHistoryItem[] = await Promise.all(

                (robot.parts_history ?? []).map(async item => {

                    const numbers: string[] = JSON.parse(item.parts_numbers || '[]')

                    const parts =
                        (await Promise.all(
                            numbers.map(n => getPartByNumber(n))
                        )).flat()

                    return {
                        ...item,
                        parts,
                        type: 'parts'
                    }

                })

            )

            if (signal.aborted) return

            const sorted = [...statusEvents, ...partsEvents].sort(

                (a, b) =>
                    new Date(b.created_at.toString() as string).getTime()
                    - new Date(a.created_at.toString() as string).getTime()

            )

            setEvents(sorted)

        } catch (err) {

            if (!signal.aborted) {
                console.error(err)
                toast.error('Failed to load history')
            }

        } finally {

            if (!signal.aborted)
                setLoading(false)

        }

    }, [robot])

    useEffect(() => {

        const controller = new AbortController()

        buildHistory(controller.signal)

        return () => controller.abort()

    }, [buildHistory])

    const toggleExpand = (id: number) =>

        setExpandedIds(prev => {

            const next = new Set(prev)

            next.has(id)
                ? next.delete(id)
                : next.add(id)

            return next
        })

    const copyHistoryEvent = async (event: HistoryEvent) => {

        if (event.type !== 'parts') return

        try {

            const time = dayjs(event.created_at.toString()).format('MM/DD HH:mm')

            const partsText = event.parts
                .map(part =>

                    `• ${part.description_orginall}
• ${part.description_eng ?? ''}
• ${part.material_number}
• ${event.quantity} pcs`

                )
                .join('\n')

            const text =
                `🤖 ${robot.robot_type ?? 'Robot'} - ${robot.robot_number ?? ''} (DAY)

${partsText}
• ${time}`

            await navigator.clipboard.writeText(text)

            toast.success('Copied to clipboard')

        } catch (err) {

            console.error(err)
            toast.error('Copy failed')

        }

    }

    if (loading) {

        return (
            <div className="w-full max-w-2xl mx-auto pl-2">
                <div className="relative border-l-2 border-border">
                    {Array.from({ length: 4 }).map((_, i) =>
                        <HistoryCardSkeleton key={i} />
                    )}
                </div>
            </div>
        )

    }

    if (events.length === 0) {

        return (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon"><CloudOff /></EmptyMedia>
                    <EmptyTitle>No History Available</EmptyTitle>
                    <EmptyDescription>
                        No history yet.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )

    }

    return (

        <div className="w-full max-w-2xl mx-auto pl-2">
            <div className="relative border-l-2 border-border">

                {events.slice(0, 25).map(event => {

                    const isExpanded = expandedIds.has(event.id)

                    const hasLongNote =
                        event.type === 'status'
                        && (event.problem_note?.length ?? 0) > NOTE_CLAMP_THRESHOLD

                    return (

                        <div key={`${event.type}-${event.id}`} className="mb-2 ml-6">

                            <RobotHistoryIcon type={event.type} />

                            <Card className="p-2">
                                <CardContent className="w-full px-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">

                                            {event.type === 'parts' &&
                                                <ClipboardList
                                                    size={16}
                                                    className="cursor-pointer hover:text-primary"
                                                    onClick={() => copyHistoryEvent(event)}
                                                />
                                            }

                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                {timeToString(event.created_at)}
                                            </span>

                                        </div>

                                        <span className="text-xs text-muted-foreground">
                                            {event.user?.user_name ?? 'Unknown'}
                                        </span>
                                    </div>

                                    {event.type === 'parts' && (
                                        <div className="flex flex-col gap-1.5">
                                            {event.parts.map(part => (
                                                <p
                                                    key={part.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Badge>
                                                        {event.quantity || 1}
                                                    </Badge>

                                                    <span className="text-xs font-mono text-nowrap text-muted-foreground">
                                                        {part.material_number}
                                                    </span>

                                                    <span className="text-xs text-muted-foreground">
                                                        {part.description_orginall}
                                                        {part.description_eng
                                                            ? ` — ${part.description_eng}`
                                                            : ''}
                                                    </span>
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    {event.type === 'status' && (
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs text-nowrap">
                                                    {event.new_status}
                                                </span>
                                                {event.problem_note && (
                                                    <>
                                                        <p className={`text-xs text-muted-foreground whitespace-pre-wrap ${
                                                            isExpanded
                                                                ? ''
                                                                : 'line-clamp-1 md:line-clamp-2'
                                                        }`}>
                                                            {event.problem_note}
                                                        </p>

                                                        {hasLongNote && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleExpand(event.id)}
                                                            >
                                                                {isExpanded
                                                                    ? <ChevronUp size={14} />
                                                                    : <ChevronDown size={14} />
                                                                }
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                    )}

                                </CardContent>
                            </Card>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default RobotHistory