import React from 'react';
import {Label} from "@/components/ui/label";
import TemplateEditDialog from "@/components/shared/Stock/TemplateEditDialog";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {timeToString} from "@/utils/timeToString";
import StockPartImage from "@/components/shared/StockPart/StockPartImage";
import Link from "next/link";
import {Separator} from "@/components/ui/separator";

interface props {
    data: IStockItemTemplate;
}

const StockItemPreview: React.FC<props> = ({ data }) => {
    return (
        <div className="group border rounded-md p-3 w-full flex gap-3">
            <div className="w-[120px] h-[120px] shrink-0 overflow-hidden rounded-md border">
                <StockPartImage avatar_url={data.avatar_url} />
            </div>

            <div className="flex flex-col justify-between min-w-0 flex-1">
                <div className="space-y-1 min-w-0">
                    <Link
                        href={`/stock-item/${data.material_number}`}
                        className="text-sm font-medium hover:text-blue-500 font-mono hover:underline break-all"
                    >
                        {data.material_number}
                    </Link>
                    <Separator />
                    <p className="text-sm font-medium line-clamp-1">
                        {data.description_eng || "-"}
                    </p>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {data.description_orginall || "-"}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-2">
                    <Label className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {timeToString(data.updated_at)}
                    </Label>

                    <div className="flex flex-wrap justify-end gap-1 max-w-[60%]">
                        {data.robot_match.map((el) => (
                            <p
                                key={el}
                                className="bg-muted px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                            >
                                {el}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockItemPreview;