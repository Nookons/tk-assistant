import {Timestamp} from "next/dist/server/lib/cache-handlers/types";

export interface IShift {
    id: number;
    created_at: Timestamp;
    shift_type: string;
    employee_name: string;
    card_id: number;
    rt_kubot_exc: number;
    rt_kubot_mini: number;
    rt_kubot_e2: number;
    abnormal_locations: number;
    abnormal_cases: number;
    shift_date: Timestamp;
    full_employees?: string[];
}