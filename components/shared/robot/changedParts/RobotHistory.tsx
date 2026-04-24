'use client'

import React, {useEffect, useState, useCallback} from 'react'
import dayjs from 'dayjs'
import {ChevronDown, ChevronUp, CloudOff, Clipboard, AlertCircle, CheckCircle, Wrench} from 'lucide-react'
import {toast} from 'sonner'
import Link from 'next/link'
import {cn} from '@/lib/utils'

import {IUser} from '@/types/user/user'
import {IRobot} from '@/types/robot/robot'
import {IStockItemTemplate} from '@/types/stock/StockItem'

import {getPartByNumber} from '@/futures/stock/getPartByNumber'

import {Skeleton} from '@/components/ui/skeleton'
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from '@/components/ui/empty'

import {timeToString} from '@/utils/timeToString'
import UserAvatar from "@/components/shared/User/UserAvatar";
import {Badge} from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

type SerializedTimestamp = { toString(): string }

interface StatusHistoryItem {
    id: number
    add_by: number
    robot_id: number
    created_at: SerializedTimestamp
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
    created_at: SerializedTimestamp
    parts_numbers: string
    user: IUser
    parts: IStockItemTemplate[]
    warehouse?: string | null
    quantity?: number | null
    type: 'parts'
}

type HistoryEvent = StatusHistoryItem | PartsHistoryItem
type ExpandKey = `${'status' | 'parts'}-${number}`

const NOTE_CLAMP_THRESHOLD = 150
const HISTORY_DISPLAY_LIMIT = 25

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useRobotHistory(robot: IRobot) {
    const [events, setEvents] = useState<HistoryEvent[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async (signal: AbortSignal) => {
        setLoading(true)
        try {
            const statusEvents: StatusHistoryItem[] = (robot.status_history ?? []).map(
                item => ({...item, type: 'status'}),
            )

            const allNumbers = new Set<string>()
            const parsedHistoryNumbers = (robot.parts_history ?? []).map(item => {
                let numbers: string[] = []
                try {
                    numbers = JSON.parse(item.parts_numbers || '[]')
                } catch {
                    console.warn('Invalid parts_numbers JSON for card', item.card_id)
                }
                numbers.forEach(n => allNumbers.add(n))
                return {item, numbers}
            })

            const partsByNumber = new Map<string, IStockItemTemplate>()
            await Promise.all(
                [...allNumbers].map(async n => {
                    if (signal.aborted) return
                    const results = await getPartByNumber(n)
                    results.flat().forEach(p => partsByNumber.set(n, p))
                }),
            )

            if (signal.aborted) return

            const partsEvents: PartsHistoryItem[] = parsedHistoryNumbers.map(({item, numbers}) => ({
                ...item,
                parts: numbers.flatMap(n => {
                    const p = partsByNumber.get(n);
                    return p ? [p] : []
                }),
                type: 'parts',
            }))

            const sorted = [...statusEvents, ...partsEvents].sort(
                (a, b) =>
                    new Date(b.created_at.toString()).getTime() -
                    new Date(a.created_at.toString()).getTime(),
            )
            setEvents(sorted)
        } catch (err) {
            if (!signal.aborted) {
                console.error(err)
                toast.error('Failed to load history')
            }
        } finally {
            if (!signal.aborted) setLoading(false)
        }
    }, [robot])

    useEffect(() => {
        const controller = new AbortController()
        load(controller.signal)
        return () => controller.abort()
    }, [load])

    return {events, loading}
}

// ─── Status badge helpers ─────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { className: string; icon: React.ReactNode }> = {
    OPERATIONAL: {
        className: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
        icon: <CheckCircle size={10}/>,
    },
    FAULT: {
        className: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
        icon: <AlertCircle size={10}/>,
    },
    MAINTENANCE: {
        className: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
        icon: <Wrench size={10}/>,
    },
}

function statusStyle(status: string) {
    return (
        STATUS_STYLES[status.toUpperCase()] ?? {
            className: 'bg-muted text-muted-foreground',
            icon: null,
        }
    )
}

// ─── Timeline dot ─────────────────────────────────────────────────────────────

function TimelineDot({type}: { type: 'parts' | 'status' }) {
    return (
        <span
            className={cn(
                'absolute p-1 -left-[17px] top-0 flex h-[34px] w-[34px] border items-center backdrop-blur-sm justify-center rounded-full',
            )}
        >
            {type === 'parts' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     className="lucide lucide-replace-icon lucide-replace">
                    <path d="M14 4a1 1 0 0 1 1-1"/>
                    <path d="M15 10a1 1 0 0 1-1-1"/>
                    <path d="M21 4a1 1 0 0 0-1-1"/>
                    <path d="M21 9a1 1 0 0 1-1 1"/>
                    <path d="m3 7 3 3 3-3"/>
                    <path d="M6 10V5a2 2 0 0 1 2-2h2"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     className="lucide lucide-corner-down-right-icon lucide-corner-down-right">
                    <path d="m15 10 5 5-5 5"/>
                    <path d="M4 4v7a4 4 0 0 0 4 4h12"/>
                </svg>
            )}
        </span>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonEvent() {
    return (
        <div className="relative pb-5 pl-7">
            <span className="absolute -left-[7px] top-[5px] h-[15px] w-[15px] rounded-full bg-muted"/>
            <div className="mb-1.5 flex justify-between">
                <Skeleton className="h-3 w-24"/>
                <Skeleton className="h-3 w-16"/>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <Skeleton className="mb-1.5 h-3 w-full"/>
                <Skeleton className="h-3 w-2/3"/>
            </div>
        </div>
    )
}

// ─── Event cards ──────────────────────────────────────────────────────────────

function PartsCard({event}: { event: PartsHistoryItem }) {
    if (!event.parts.length) return null
    return (
        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            {event.parts.map((part, i) => (
                <div
                    key={part.id}
                    className={cn(
                        'flex items-baseline gap-2.5 py-1.5',
                        i > 0 && 'border-t border-border/40',
                    )}
                >
                    <span className="text-xs">
                        ×{event.quantity ?? 1}
                    </span>
                    <Link
                        href={`/stock-item/${part.material_number}`}
                        className="shrink-0 font-mono text-xs hover:underline hover:text-blue-500"
                    >
                        {part.material_number}
                    </Link>
                    <span className="truncate text-xs text-foreground">
                        {part.description_orginall}
                        {part.description_eng ? ` — ${part.description_eng}` : ''}
                    </span>
                </div>
            ))}
        </div>
    )
}

interface StatusCardProps {
    event: StatusHistoryItem
    isExpanded: boolean
    hasLongNote: boolean
    onToggle: () => void
}

function StatusCard({event, isExpanded, hasLongNote, onToggle}: StatusCardProps) {
    const {className: badgeClass, icon} = statusStyle(event.new_status)
    return (
        <div className={cn(`rounded-lg bg-muted/20 px-3 py-2`)}>
            <div className="flex items-start gap-2">
                <div className={`flex items-center gap-2`}>
                    <p className={`text-xs`}>{icon}</p>
                    <p className={`text-xs`}>{event.new_status}</p>
                </div>
                {event.problem_note && (
                    <div className="min-w-0 flex-1">
                        <p className={cn('text-xs leading-relaxed text-foreground', !isExpanded && 'line-clamp-2')}>
                            — {event.problem_note}
                        </p>
                        {hasLongNote && (
                            <button
                                onClick={onToggle}
                                className="mt-1 flex items-center gap-1 text-xs text-foreground hover:text-muted-foreground"
                            >
                                {isExpanded
                                    ? <><ChevronUp size={12}/> Show less</>
                                    : <><ChevronDown size={12}/> Show more</>
                                }
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}


export default function RobotHistory({robot}: { robot: IRobot }) {
    const {events, loading} = useRobotHistory(robot)
    const [expandedKeys, setExpandedKeys] = useState<Set<ExpandKey>>(new Set())

    const toggleExpand = (key: ExpandKey) =>
        setExpandedKeys(prev => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })

    if (loading) {
        return (
            <div className="w-full max-w-xl">
                <div className="relative border-l border-border/50 pl-0">
                    {Array.from({length: 4}, (_, i) => <SkeletonEvent key={i}/>)}
                </div>
            </div>
        )
    }

    if (events.length === 0) {
        return (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon"><CloudOff/></EmptyMedia>
                    <EmptyTitle>No History Available</EmptyTitle>
                    <EmptyDescription>No history recorded for this robot.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className="w-full">
            <div className="relative border-l flex flex-col gap-1 border-foreground">
                {events.slice(0, HISTORY_DISPLAY_LIMIT).map(event => {
                    const expandKey: ExpandKey = `${event.type}-${event.id}`
                    const isExpanded = expandedKeys.has(expandKey)
                    const hasLongNote =
                        event.type === 'status' &&
                        (event.problem_note?.length ?? 0) > NOTE_CLAMP_THRESHOLD


                    return (
                        <div key={expandKey} className={cn(
                            'relative pb-5 p-2 rounded-r-2xl pl-7',
                            event.type === 'parts'
                                ? "bg-primary/10"
                                : cn(
                                    event.new_status === '离线 | Offline' && 'dark:bg-rose-500/25 bg-rose-500/50 ',
                                    event.new_status === '在线 | Online' && 'dark:bg-emerald-500/25 bg-emerald-500/50'
                                )
                        )}>
                            <TimelineDot type={event.type}/>

                            <div className="mb-1.5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <p className={`text-xs text-foreground/25`}>#{event.id}</p>
                                    <span className="font-mono text-xs tabular-nums ">
                                        {timeToString(event.created_at.toString())}
                                    </span>
                                </div>
                                <div className={`flex items-center gap-2 pr-1`}>
                                    <Link href={`/user/${event.user.auth_id}`} className="text-xs dark:text-muted-foreground hover:text-blue-500 hover:underline">
                                        {event.user?.user_name ?? 'Unknown'}
                                    </Link>
                                    <div className={`w-8 h-8 rounded overflow-hidden`}>
                                        <UserAvatar user={event.user} allowFullscreen />
                                    </div>
                                </div>
                            </div>

                            {event.type === 'parts' && <PartsCard event={event}/>}
                            {event.type === 'status' && (
                                <StatusCard
                                    event={event}
                                    isExpanded={isExpanded}
                                    hasLongNote={hasLongNote}
                                    onToggle={() => toggleExpand(expandKey)}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}