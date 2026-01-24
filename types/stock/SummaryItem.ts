import {IUser} from "@/types/user/user";
import {IStockItemTemplate} from "@/types/stock/StockItem";

export interface ISummaryItemStock {
    id: number;
    created_at: Date;
    updated_at: Date;
    quantity: number;
    last_update_by: number;
    material_number: string;
    warehouse: 'GLPC' | 'SMALL P3' | "PNT";
    location: string;
    user_updated: IUser;
    part_info: IStockItemTemplate;
}