import {IWarehouse} from "@/types/Warehouse/Warehouse";
import {IUser} from "@/types/user/user";

export interface IUserSession {
    id: number
    employee_id: number
    warehouse_id: number
    type: 'home' | 'warehouse' | string // можно сузить при необходимости
    started_at: string
    ended_at: string | null
    created_by: number | null
    warehouse_sessions: string
    warehouse: IWarehouse
    user: IUser
}