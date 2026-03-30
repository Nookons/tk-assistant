import { IUser } from "@/types/user/user";
import { supabase } from "@/lib/supabase/client";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";

export class UserService {

    static async updateUserName(userId: string, new_name: string): Promise<IUser | null> {
        const { data, error } = await supabase
            .from('employees')
            .update({ user_name: new_name })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Update user name error:', error);
            return null;
        }

        return data;
    }

    static async getUserStockHistory(user: IUser): Promise<IHistoryStockItem[] | null> {
        const { data, error } = await supabase
            .from('stock_history')
            .select(`*, user:employees!card_id(*), robot_data:robots_maintenance_list!robot_id(*)`)
            .eq('card_id', user.card_id)

        if (error) {
            console.error('Update user name error:', error);
            return null;
        }

        return data;
    }
}