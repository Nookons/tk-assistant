"use client";
import React, {useEffect, useMemo, useState} from 'react';
import PagesHeader from "@/components/shared/PagesHeader";
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {TemplateService} from "@/services/templateService";
import StockPartImage from "@/components/shared/StockPart/StockPartImage";
import {Skeleton} from "@/components/ui/skeleton";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";
import {timeToString} from "@/utils/timeToString";
import {IStockLocationSlot} from "@/types/stock/StockItem";
import dayjs from "dayjs";
import {ArrowRightLeft, Bot, Locate, Pencil, Warehouse} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Empty, EmptyHeader, EmptyTitle} from "@/components/ui/empty";
import TemplateEditDialog from "@/components/shared/Stock/TemplateEditDialog";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {format} from "date-fns";

function Row({label, value}: { label: string; value?: string | number | null }) {
    if (value === null || value === undefined || value === "") return null;
    return (
        <div className="flex justify-between items-center py-2.5 px-3 hover:bg-muted/40 transition-colors">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="text-sm font-medium text-right max-w-[60%] break-words">{String(value)}</span>
        </div>
    );
}

function SectionTitle({title}: { title: string }) {
    return (
        <div className="px-3 py-2 bg-muted/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        </div>
    );
}

function SlotCard({slot}: { slot: IStockLocationSlot }) {
    return (
        <div className="border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slot</span>
                <Badge variant="secondary" className="font-mono text-xs">{slot.location_key}</Badge>
            </div>
            <Separator/>
            <Row label="Warehouse" value={slot.warehouse}/>
            <Separator/>
            <Row label="Location" value={slot.location}/>
            <Separator/>
            <Row label="Quantity" value={slot.quantity}/>
            <Separator/>
            <Row label="Updated At" value={timeToString(slot.updated_at)}/>
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="p-6 max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-[280px_1fr] gap-6">
                <Skeleton className="aspect-square w-full rounded-xl"/>
                <div className="space-y-2">
                    {Array.from({length: 7}).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg"/>
                    ))}
                </div>
            </div>
        </div>
    );
}

function UsageHistorySkeleton({material_number}: { material_number: string }) {
    const {data, isLoading, isError} = useQuery({
        queryKey: [`stock-item-history-${material_number}`],
        queryFn: () => TemplateService.getTemplateHistory(material_number),
        enabled: !!material_number,
    });

    const sorted_data = useMemo(() => {
        if (!data) return null;
        return [...data].sort(
            (a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
        );
    }, [data]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading history</div>;
    if (!sorted_data?.length) return (
        <Empty className="h-full bg-muted/30">
            <EmptyHeader>
                <EmptyTitle>No any history</EmptyTitle>
            </EmptyHeader>
        </Empty>
    );

    return (
        <Card>
            <CardContent className="space-y-4">
                {sorted_data.map((item) => {
                    const isNegative = item.quantity < 0;
                    return (
                        <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-start gap-3 pb-4 last:pb-0 border-b last:border-0"
                        >
                            <div className="grid grid-cols-3 gap-2 w-full items-center">
                                <div className="flex items-center gap-2">
                                        <span
                                            className={`text-base font-semibold ${
                                                isNegative ? "text-red-500" : "text-green-600"
                                            }`}
                                        >
                                            {isNegative ? "" : "+"}
                                            {item.quantity}
                                        </span>
                                    <Separator orientation={`vertical`}/>
                                    <div className={`flex items-center gap-2`}>
                                        <span className="text-sm text-muted-foreground">
                                          {item.user.user_name}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                    {item.location && (
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Locate size={14}/>
                                            <span className={`text-foreground font-medium`}>{item.location}</span>
                                        </div>
                                    )}
                                    {item.robot_data && (
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Bot size={14}/>
                                            <span className={`text-foreground font-medium`}>{item.robot_data.robot_number}</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`flex items-center gap-4 justify-end`}>
                                    <span className="text-xs text-right text-muted-foreground">
                                        {format(new Date(item.created_at), "dd MMM yyyy, HH:mm")}
                                    </span>
                                    {item.warehouse && (
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Warehouse size={14}/>
                                            <span>{item.warehouse}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

function StockSlots({material_number}: { material_number: string }) {
    const {data, isLoading, isError} = useQuery({
        queryKey: [`stock-item-slots-${material_number}`],
        queryFn: () => TemplateService.getTemplateStockSlots(material_number),
        enabled: !!material_number,
        retry: 3
    });

    const sorted_data = useMemo(() => {
        if (!data) return null;
        return [...data].sort(
            (a, b) => dayjs(b.updated_at).valueOf() - dayjs(a.updated_at).valueOf()
        );
    }, [data]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading slots</div>;
    if (!sorted_data?.length) return (
        <Empty className="h-full bg-muted/30">
            <EmptyHeader>
                <EmptyTitle>No any slot</EmptyTitle>
            </EmptyHeader>
        </Empty>
    );

    return (
        <div className="border rounded-xl overflow-hidden">
            <SectionTitle title="Stock Locations"/>

            <div className="divide-y">
                {sorted_data.map((slot) => (
                    <Link
                        key={slot.id}
                        href={`/stock/cell?location=${encodeURIComponent(slot.location_key)}&warehouse=${encodeURIComponent(slot.warehouse)}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                        {/* Left */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Warehouse size={16}/>
                                <span>{slot.warehouse}</span>
                            </div>

                            {slot.location && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Locate size={14}/>
                                    <span>{slot.location}</span>
                                </div>
                            )}
                        </div>

                        {/* Right */}
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-semibold">
                                {slot.quantity}
                            </span>

                            <span className="text-xs text-muted-foreground">
                                {dayjs(slot.updated_at).format("DD MMM, HH:mm")}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

const Page = () => {
    const params = useParams();
    const itemId = params?.id as string;

    const {data, isLoading, isError} = useQuery({
        queryKey: [`stock-item-${itemId}`],
        queryFn: () => TemplateService.getTemplateDetails(itemId),
        enabled: !!itemId,
    });

    if (isLoading) return <div><PagesHeader/><PageSkeleton/></div>;
    if (isError || !data) return (
        <div>
            <PagesHeader/>
            <div className="p-6 text-sm text-muted-foreground">Failed to load item.</div>
        </div>
    );

    return (
        <div className={`min-h-dvh bg-background`}>
            <PagesHeader/>

            <div className="p-6 max-w-full grid md:grid-cols-2 gap-4 mx-auto space-y-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-[280px_1fr] gap-6 items-start">
                    <div className="space-y-4">
                        <div className="md:w-[280px] md:h-[280px] shrink-0 overflow-hidden rounded-xl border">
                            <StockPartImage avatar_url={data.avatar_url}/>
                        </div>

                        {data.robot_match?.length > 0 && (
                            <div className="border rounded-xl overflow-hidden">
                                <SectionTitle title="Robot Match"/>
                                <div className="flex flex-wrap gap-1.5 p-3">
                                    {data.robot_match.map((robot) => (
                                        <Badge key={robot} variant="outline" className="text-xs font-mono">
                                            {robot}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <StockSlots material_number={itemId}/>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="border rounded-xl overflow-hidden">
                            <SectionTitle title="Actions"/>
                            <div className={`p-2 space-x-2`}>
                                {/*<Button> <ArrowRightLeft /> Use on Robot</Button>*/}
                                <div className="">
                                    <TemplateEditDialog part={data}/>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-xl overflow-hidden">
                            <SectionTitle title="General"/>
                            <Row label="Material Number" value={data.material_number}/>
                            <Separator/>
                            <Row label="Part Type" value={data.part_type}/>
                            <Separator/>
                            <Row label="Company" value={data.assigned_company}/>
                        </div>

                        <div className="border rounded-xl overflow-hidden">
                            <SectionTitle title="Description"/>
                            {data.description_orginall && (
                                <>
                                    <div className="px-3 py-2.5">
                                        <p className="text-xs text-muted-foreground mb-1">Original</p>
                                        <p className="text-sm">{data.description_orginall}</p>
                                    </div>
                                    <Separator/>
                                </>
                            )}
                            {data.description_eng && (
                                <div className="px-3 py-2.5">
                                    <p className="text-xs text-muted-foreground mb-1">English</p>
                                    <p className="text-sm">{data.description_eng}</p>
                                </div>
                            )}
                        </div>

                        <div className="border rounded-xl overflow-hidden">
                            <SectionTitle title="Meta"/>
                            <Row label="Created By" value={data.user?.user_name}/>
                            <Separator/>
                            <Row label="Created At" value={timeToString(data.created_at)}/>
                            <Separator/>
                            <Row label="Updated At" value={timeToString(data.updated_at)}/>
                        </div>
                    </div>
                </div>

                <div className="">
                    <UsageHistorySkeleton material_number={itemId}/>
                </div>
            </div>
        </div>
    );
};

export default Page;