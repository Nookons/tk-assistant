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
        <div className="grid relative md:grid-cols-[120px_1fr] group border p-2 rounded-md w-full gap-2">
            <StockPartImage avatar_url={data.avatar_url}/>

            <div className="flex flex-col gap-1 min-w-0">
                <div className="md:opacity-0 absolute bottom-0 right-0 group-hover:opacity-100 transition shrink-0">
                    <TemplateEditDialog part={data}/>
                </div>

                <div className={`flex flex-col gap-2 min-w-0`}>
                    <p className="line-clamp-1 text-sm">{data.description_eng}</p>
                    <p className="line-clamp-1 text-sm">{data.description_orginall ?? "-"}</p>
                    <Label className="cursor-pointer truncate">{data.material_number}</Label>
                    <Label className="text-xs text-muted-foreground">{timeToString(data.updated_at)}</Label>
                    <div className="text-xs flex items-center gap-1">
                        {data.robot_match.map((el) => (
                            <code key={el} className="rounded text-nowrap bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
                                {el}
                            </code>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockItemPreview;