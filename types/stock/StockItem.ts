import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {IUser} from "@/types/user/user";

export interface IStockItemTemplate {
    id: number;
    created_at: Timestamp | string;
    updated_at: Timestamp | string;
    add_by: number;
    material_number: string;
    description_orginall: string;
    description_eng: string;
    part_type: string;
    avatar_url: string;
    robot_match: string[];
    user?: IUser;
}

export interface IStockLocationSlot{
    id: number;
    created_at: Timestamp | string;
    updated_at: Timestamp | string;
    quantity: number;
    last_update_by: number;
    material_number: string;
    warehouse: string;
    location: string;
    location_key: string;
}