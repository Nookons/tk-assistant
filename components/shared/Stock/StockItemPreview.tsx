import React from 'react';
import {Label} from "@/components/ui/label";
import TemplateEditDialog from "@/components/shared/Stock/TemplateEditDialog";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {timeToString} from "@/utils/timeToString";
import StockPartImage from "@/components/shared/StockPart/StockPartImage";

interface props {
    data: IStockItemTemplate;
}

const StockItemPreview: React.FC<props> = ({data}) => {
    return (
        <div className="grid md:grid-cols-[120px_1fr] group border p-2 rounded-md w-full gap-2">
            <StockPartImage avatar_url={data.avatar_url} />

            <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                    <Label className="text-xs flex flex-wrap gap-1">
                        {data.robot_match.map((el) => (
                            <code key={el} className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
                                {el}
                            </code>
                        ))}
                    </Label>
                    <div className="md:opacity-0 group-hover:opacity-100 transition shrink-0">
                        <TemplateEditDialog part={data} />
                    </div>
                </div>

                <p className="line-clamp-2 text-sm">{data.description_eng}</p>
                <Label className="cursor-pointer truncate">{data.material_number}</Label>
                <Label className="text-xs text-muted-foreground">{timeToString(data.updated_at)}</Label>
            </div>
        </div>
    );
};

export default StockItemPreview;