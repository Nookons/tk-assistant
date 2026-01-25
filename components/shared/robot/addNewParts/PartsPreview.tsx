import React, {use, useEffect, useState} from 'react';
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {getPartByNumber} from "@/futures/stock/getPartByNumber";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {Item} from "@/components/ui/item";
import dayjs from "dayjs";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {ScrollArea} from "@/components/ui/scroll-area";
import {HandCoins, MapPin, TriangleAlert} from "lucide-react";
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

            console.log("Все данные получены:", results);

            const flatResults = results.flat().filter(Boolean);
            setPreview_data(flatResults)

        } catch (error) {
            // Если ХОТЯ БЫ ОДИН запрос упадет, сработает этот блок
            console.error("Ошибка при получении превью деталей:", error);
        }
    }


    useEffect(() => {
        getPartsPreview(parts_data)
    }, [parts_data]);


    if (parts_data.length < 1) {
        return (
            <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <TriangleAlert />
                    </EmptyMedia>
                    <EmptyTitle>No Parts</EmptyTitle>
                    <EmptyDescription>
                        You&apos;re all caught up. New notifications will appear here.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <ScrollArea className="max-h-[550px] md:max-h-[750px] overflow-y-auto">
            <div className={`flex flex-col gap-2`}>
                {preview_data.map((item, index) => {

                    return (
                        <Item variant={`muted`} className={`flex flex-col justify-start items-start gap-2`} key={`${item.material_number}-${index}`}>
                            <Badge>{item.material_number}</Badge>
                            <div className={`flex flex-wrap items-center gap-2 w-full`}>
                                {selected_amounts.filter(i => i.material_number === item.material_number).map(j => (
                                    <div className={`border p-2 rounded-xl flex items-center gap-2`}>
                                        <Checkbox
                                            checked={picked_location?.location === j.location}
                                            onCheckedChange={() => setPicked_location(j)}
                                            id="terms-checkbox-invalid"
                                            name="terms-checkbox-invalid"
                                            aria-invalid
                                        />
                                        <div className={`flex  gap-2`}>
                                            <div className={`flex items-center gap-2`}>
                                                <MapPin className={`text-muted-foreground`} size={16} />
                                                <span className={`font-bold text-base`}>{j.location.split("").join("-")}</span>
                                            </div>
                                            <Separator orientation={'vertical'} className={`my-2 w-full`} />
                                            <div className={`flex items-center gap-2`}>
                                                <HandCoins className={`text-muted-foreground`} size={16} />
                                                <span className={`font-bold text-base`}>{j.quantity.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={`w-full`}>
                                <article>{item.description_orginall}</article>
                                <article>{item.description_eng}</article>
                                <Separator className={`my-2 w-full`}/>
                                <div className={`flex gap-2 justify-between w-full`}>
                                    <h1 className={`text-xs text-muted-foreground`}>Last
                                        Update: {dayjs(item.updated_at).format(`HH:mm · MMM D, YYYY`)}</h1>
                                    <article>{item.user?.user_name}</article>
                                </div>
                            </div>
                        </Item>
                    )
                })}
            </div>
        </ScrollArea>
    );
};

export default PartsPreview;