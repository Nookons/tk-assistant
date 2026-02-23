import {IUser} from "@/types/user/user";

export interface NoteItem {
    id: number;
    created_at: string;
    add_by: number;
    date: string;
    note: string;
    user: IUser;
}
