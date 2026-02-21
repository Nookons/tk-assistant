import { IUser } from "@/types/user/user";
import { supabase } from "@/lib/supabaseClient";

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
}