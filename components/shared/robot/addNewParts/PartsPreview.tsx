import React, {useEffect, useState} from 'react';
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {getPartByNumber} from "@/futures/stock/getPartByNumber";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {Item} from "@/components/ui/item";
import dayjs from "dayjs";
import {Badge} from "@/components/ui/badge";
import {ScrollArea} from "@/components/ui/scroll-area";
import {MapPin, TriangleAlert} from "lucide-react";
import {IStockAmountItem} from "@/types/stock/StockAmounts";
import {Checkbox} from "@/components/ui/checkbox";

const PartsPreview = (
    {parts_data, selected_amounts, setPicked_location, picked_location}:
    { parts_data: string[], selected_amounts: IStockAmountItem[], setPicked_location: (item: IStockAmountItem) => void, picked_location: IStockAmountItem | null}) => {

    const [preview_data, setPreview_data] = useState<IStockItemTemplate[]>([])

    const getPartsPreview = async (parts_data: string[]) => {
        try {
            const promises = parts_data.map((part: string) => getPartByNumber(part));
            const results = await Promise.all(promises);

            const flatResults = results.flat().filter(Boolean);
            setPreview_data(flatResults)
        } catch (error) {
            console.error("Error getting parts preview:", error);
        }
    }

    useEffect(() => {
        getPartsPreview(parts_data)
    }, [parts_data]);

    if (parts_data.length < 1) {
        return (
            <Empty className="h-full">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <TriangleAlert />
                    </EmptyMedia>
                    <EmptyTitle>No Parts Selected</EmptyTitle>
                    <EmptyDescription>
                        Select parts from the list above to see their details here.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <ScrollArea className="max-h-[550px] md:max-h-[750px]">
            <div className="flex flex-col gap-3">
                {preview_data.map((item, index) => (
                    <Item
                        key={`${item.material_number}-${index}`}
                        variant="muted"
                        className="rounded-xl p-3 flex flex-col items-start w-full"
                    >
                        {/* Header */}
                        <div className="mb-2 w-full flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                                {item.material_number}
                            </Badge>

                            <span className="text-xs text-muted-foreground">
                                {item.user?.user_name}
                            </span>
                        </div>

                        {/* Locations */}
                        <div className="mb-3 flex flex-wrap gap-2">
                            {selected_amounts
                                .filter(i => i.material_number === item.material_number)
                                .map(j => (
                                    <label
                                        key={j.location}
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1 text-xs hover:bg-muted/50 transition-colors"
                                    >
                                        <Checkbox
                                            checked={picked_location?.location === j.location}
                                            onCheckedChange={() => setPicked_location(j)}
                                        />

                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <MapPin size={14} />
                                            {j.location}
                                        </span>

                                        <span className="text-foreground font-medium">
                                          {j.quantity.toLocaleString()}
                                        </span>
                                    </label>
                                ))}
                        </div>

                        {/* Description */}
                        <div className="space-y-1 text-sm">
                            <p className="font-medium">{item.description_eng || item.description_orginall}</p>
                            {item.description_eng && item.description_orginall && item.description_eng !== item.description_orginall && (
                                <p className="text-muted-foreground">
                                    {item.description_orginall}
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-3 text-xs text-muted-foreground">
                            Last updated · {dayjs(item.updated_at).format("HH:mm · MMM D, YYYY")}
                        </div>
                    </Item>
                ))}
            </div>
        </ScrollArea>
    );
};

export default PartsPreview;