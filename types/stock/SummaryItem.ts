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

// Один айтем в локации
export interface LocationItem {
    material_number: string;
    description_eng: string;       // описание вместо description_eng
    total_quantity: number;
    warehouse: string;
    location_key: string;
}

// Локация со всеми айтемами
export interface LocationStock {
    location: string;
    items: LocationItem[];
}

// Тип для всего ответа
export type StockByLocationResponse = LocationStock[] ;
