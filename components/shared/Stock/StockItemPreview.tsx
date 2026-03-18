import React, {useState} from 'react';
import {Bot} from "lucide-react";
import {Label} from "@/components/ui/label";
import TemplateEditDialog from "@/components/shared/Stock/TemplateEditDialog";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {timeToString} from "@/utils/timeToString";
import ImageDisplay from "@/components/shared/ImageDisplay";

interface props {
    data: IStockItemTemplate;
}

const StockItemPreview: React.FC<props> = ({data}) => {
    return (
        <div className={`flex items-start gap-2 backdrop-blur-sm border p-2 rounded-md w-full`}>
            <div className={`grid md:grid-cols-[120px_1fr] gap-4 w-full`}>
                <ImageDisplay avatar_url={data.avatar_url} data={data} />

                <div className={`flex flex-col gap-2 w-full`}>
                    <div className={`flex items-center w-full justify-between gap-4`}>
                        <Label className={`text-xs`}>
                            <Bot className="w-4 h-4 inline"/>
                            {data.robot_match?.join(' | ')}
                        </Label>
                        <TemplateEditDialog part={data}/>
                    </div>

                    <p className={`line-clamp-1`}>{data.description_eng}</p>
                    <Label className="cursor-pointer">
                        {data.material_number}
                    </Label>
                    <Label className={`text-xs text-muted-foreground`}>
                        {timeToString(data.updated_at)}
                    </Label>
                </div>
            </div>
        </div>
    );
};

export default StockItemPreview;