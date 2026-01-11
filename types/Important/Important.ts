import {IUser} from "@/types/user/user";


export interface NoteItem {
    id: number;
    created_at: string; // ISO date string
    add_by: number;
    date: string; // ISO date string
    note: string;
    user: IUser;
}