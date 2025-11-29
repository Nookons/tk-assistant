import {Timestamp} from "next/dist/server/lib/cache-handlers/types";

export interface IStockItemTemplate {
    id: number;
    created_at: Timestamp;
    updated_at: Timestamp;
    add_by: number;
    material_number: string;
    description_orginall: string;
    description_eng: string;
    part_type: string;
}