import {IUser} from "@/types/user/user";

export interface IHistoryStockItem {
    id: number;
    created_at: Date;
    add_by: number;
    material_number: string;
    value: number;
    warehouse: string;
    location: string;
    user: IUser;
}