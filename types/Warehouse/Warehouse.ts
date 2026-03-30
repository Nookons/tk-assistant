import {Timestamp} from "next/dist/server/lib/cache-handlers/types";

export interface IWarehouse {
    id: number;
    created_at: Timestamp;
    title: string;
    address: string;
}