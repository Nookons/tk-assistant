import {IUser} from "@/types/user/user";

export interface IHistoryStockItem {
    id: number | string;
    created_at: Date;
    card_id: number;
    material_number: string;
    quantity: number;
    warehouse: string;
    location: string;
    user: IUser;
}