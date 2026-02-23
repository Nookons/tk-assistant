'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import {
    Activity, ChevronDown, ChevronUp, CloudOff, Combine,
    Loader, MapPin, MoveRight, PackageMinus, Trash2, Hash,
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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from '@/components/ui/empty'
import {timeToString} from "@/utils/timeToString";
import {RobotHistoryIcon} from "@/utils/RobotHistoryIcon";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

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



// Skeleton for a single history card
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

// ─────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────

const RobotHistory = ({ robot }: { robot: IRobot }) => {
    const [events, setEvents]           = useState<HistoryEvent[]>([])
    const [loading, setLoading]         = useState(true)

    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

    const user            = useUserStore(state => state.currentUser)
    const removeFromStock = useRobotsStore(state => state.deletePartsHistory)

    const buildHistory = useCallback(async (signal: AbortSignal) => {
        setLoading(true)

        try {
            const statusEvents: StatusHistoryItem[] = (robot.status_history ?? []).map(item => ({
                ...item,
                type: 'status' as const,
            }))

            const partsEvents: PartsHistoryItem[] = await Promise.all(
                (robot.parts_history ?? []).map(async item => {
                    const numbers: string[] = JSON.parse(item.parts_numbers || '[]')
                    const parts = (await Promise.all(numbers.map(n => getPartByNumber(n)))).flat()
                    return {
                        ...item,
                        parts,
                        warehouse: item.warehouse ?? null,
                        quantity: item.quantity ?? null,
                        type: 'parts' as const,
                    }
                }),
            )

            if (signal.aborted) return

            const sorted = [...statusEvents, ...partsEvents].sort(
                (a, b) => new Date(b.created_at.toString() as string).getTime() - new Date(a.created_at.toString() as string).getTime(),
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
        buildHistory(controller.signal)
        return () => controller.abort()
    }, [buildHistory])

    // ── Delete handler ────────────────────────────────────────
    const handleDelete = async (partsId: number, robotId: number) => {
        setDeletingIds(prev => new Set(prev).add(partsId))
        try {
            const res = await removeParts(partsId.toString(), user?.card_id.toString() ?? '')
            if (res) {
                removeFromStock(res.robot_id, res.id)
                setEvents(prev => prev.filter(e => e.id !== partsId))
            }
        } catch (err) {
            console.error(err)
            toast.error(`Error deleting parts history: ${err}`)
        } finally {
            setDeletingIds(prev => {
                const next = new Set(prev)
                next.delete(partsId)
                return next
            })
        }
    }

    const toggleExpand = (id: number) =>
        setExpandedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })

    // ── Loading state ─────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full max-w-2xl mx-auto pl-2">
                <div className="relative border-l-2 border-border">
                    {Array.from({ length: 4 }).map((_, i) => <HistoryCardSkeleton key={i} />)}
                </div>
            </div>
        )
    }

    // ── Empty state ───────────────────────────────────────────
    if (events.length === 0) {
        return (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon"><CloudOff /></EmptyMedia>
                    <EmptyTitle>No History Available</EmptyTitle>
                    <EmptyDescription>
                        No history yet. When you add parts or change status, it will appear here.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    // ── Timeline ──────────────────────────────────────────────
    return (
        <div className="w-full max-w-2xl mx-auto pl-2">
            <div className="relative border-l-2 border-border">
                {events.slice(0, 25).map(event => {
                    const isExpanded    = expandedIds.has(event.id)
                    const isDeleting    = deletingIds.has(event.id)
                    const hasLongNote   = event.type === 'status'
                        && (event.problem_note?.length ?? 0) > NOTE_CLAMP_THRESHOLD

                    return (
                        <div key={`${event.type}-${event.id}`} className="mb-2 ml-6">
                            <RobotHistoryIcon type={event.type} />

                            <Card className="p-2">
                                <CardContent className="w-full px-2">

                                    {/* Row: date + user + delete */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            {timeToString(event.created_at)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                {event.user?.user_name ?? 'Unknown'}
                                            </span>

                                            {event.type === 'parts' && event.card_id === user?.card_id && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-auto p-1"
                                                            disabled={isDeleting}
                                                        >
                                                            {isDeleting
                                                                ? <Loader className="h-4 w-4 animate-spin" />
                                                                : <Trash2 className="h-4 w-4" />
                                                            }
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Parts History?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete
                                                                this parts history entry from the robot's records.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(event.id, event.robot_id)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── PARTS event ── */}
                                    {event.type === 'parts' && (
                                        <div className="space-y-3">

                                            {/* Location + Qty stubs */}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                            {/* TODO: replace with real warehouse field */}
                            {event.warehouse ?? (
                                <span className="italic opacity-50">Location — coming soon</span>
                            )}
                        </span>
                                                <span className="flex items-center gap-1">
                          <Hash size={11} />
                                                    {/* TODO: replace with real quantity field */}
                                                    {event.quantity != null
                                                        ? `Qty: ${event.quantity}`
                                                        : <span className="italic opacity-50">Qty — coming soon</span>
                                                    }
                        </span>
                                            </div>

                                            {/* Parts list */}
                                            <div className="flex flex-col gap-1.5">
                                                {event.parts.map(part => (
                                                    <Link
                                                        key={part.id}
                                                        href={`/stock/${part.material_number}`}
                                                        className="group flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors"
                                                    >
                                                        <PackageMinus size={15} className="shrink-0 text-muted-foreground" />
                                                        <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                              {part.material_number}
                            </span>
                                                        <span className="text-xs line-clamp-1 text-muted-foreground group-hover:text-foreground transition-colors">
                              {part.description_orginall}
                                                            {part.description_eng ? ` — ${part.description_eng}` : ''}
                            </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── STATUS event ── */}
                                    {event.type === 'status' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <MoveRight size={14} className="text-muted-foreground shrink-0" />
                                                <Activity
                                                    size={14}
                                                    className={event.new_status === '离线 | Offline' ? 'text-destructive' : 'text-emerald-500'}
                                                />
                                                <span className="text-xs">{event.new_status}</span>
                                            </div>

                                            {(event.type_problem || event.problem_note) && (
                                                <div className="space-y-1.5 pl-1">
                                                    {event.problem_note && (
                                                        <>
                                                            <p
                                                                className={`text-xs text-muted-foreground whitespace-pre-wrap break-words ${
                                                                    isExpanded ? '' : 'line-clamp-2'
                                                                }`}
                                                            >
                                                                {event.problem_note}
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                {event.type_problem && (
                                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                                                        {event.type_problem}
                                                                    </Badge>
                                                                )}
                                                                {hasLongNote && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        type="button"
                                                                        onClick={() => toggleExpand(event.id)}
                                                                        className="h-auto p-1 text-xs text-primary hover:text-primary/80"
                                                                    >
                                                                        {isExpanded ? (
                                                                            <><ChevronUp className="h-3 w-3 mr-1" />Show less</>
                                                                        ) : (
                                                                            <><ChevronDown className="h-3 w-3 mr-1" />Show more</>
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                    {!event.problem_note && event.type_problem && (
                                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                                            {event.type_problem}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
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