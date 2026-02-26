import {IUser} from "@/types/user/user";
import {IStockItemTemplate} from "@/types/stock/StockItem";

export interface ISummaryItemStock {
    id: number;
    created_at: Date;
    updated_at: Date;
    quantity: number;
    last_update_by: number;
    material_number: string;
    warehouse: 'GLPC' | 'SMALL P3' | "PNT" | "P3";
    location: string;
    user_updated: IUser;
    part_info: IStockItemTemplate;
}

export interface LocationItem {
    material_number: string;
    description_eng: string;
    total_quantity: number;
    warehouse: string;
    location_key: string;
}

export interface LocationStock {
    location: string;
    items: LocationItem[];
}

export type StockByLocationResponse = LocationStock[] ;
