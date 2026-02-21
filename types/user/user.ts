import {Timestamp} from "next/dist/server/lib/cache-handlers/types";

export interface IUser {
    id: number;
    created_at: Timestamp;
    user_name: string;
    card_id: number;
    email: string;
    phone: number;
    warehouse: string;
    updated_at: Timestamp;
    score: number;
    position: string;
    avatar_url: string;
    auth_id: string;
    last_login_at: Timestamp;
}