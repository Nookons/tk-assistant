import {IUser} from "@/types/user/user";

export interface IHistoryStockItem {
    id: number | string;
    created_at: Date;
    add_by: number;
    material_number: string;
    quantity: number;
    warehouse: string;
    location: string;
    user: IUser;
}