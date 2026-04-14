"use client";
import React from 'react';
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
import TemplateEditDialog from "@/components/shared/Stock/TemplateEditDialog";
import ItemHistory from "@/components/shared/stock-item/item-history";
import AddPartsDisplay from "@/components/shared/stock-item/AddPartsDisplay";
import StockSlots from "@/components/shared/stock-item/stock-slots";

function Row({label, value}: { label: string; value?: string | number | null }) {
    if (value === null || value === undefined || value === "") return null;
    return (
        <div className="flex justify-between items-center py-2.5 px-3 hover:bg-muted/40 transition-colors">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="text-sm font-medium text-right max-w-[60%] wrap-break-word">{String(value)}</span>
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
                            <StockSlots material_number={itemId} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="border rounded-xl overflow-hidden">
                            <SectionTitle title="Actions"/>

                            <div className={`p-2 space-x-2`}>
                                <div className="flex gap-1 items-center">
                                    <TemplateEditDialog part={data}/>
                                    <AddPartsDisplay part={data}/>
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
                            <Row label="Updated At" value={timeToString(dayjs(data.updated_at).add(2, 'h').toString())}/>
                        </div>
                    </div>
                </div>

                {/*<div className="">
                    <ItemHistory material_number={data.material_number} />
                </div>*/}
            </div>
        </div>
    );
};

export default Page;