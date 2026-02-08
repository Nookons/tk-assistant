import {IUser} from "@/types/user/user";
import {supabase} from "@/lib/supabaseClient";

export class AuthService {

    static async getUserByCardId(cardId: string): Promise<IUser | null> {
        const { data, error } = await supabase
            .from('employees')
            .select('id, created_at, user_name, card_id, email, phone, warehouse, updated_at, score, position, avatar_url, auth_id')
            .eq('card_id', cardId)
            .maybeSingle();

        if (error || !data) {
            throw new Error('User not found');
        }

        return data;
    }

    static async loginWithCard(cardId: string, password: string) {
        const user = await this.getUserByCardId(cardId);

        if (!user) {
            throw new Error('Invalid card ID');
        }

        let email;

        if (!user.email || user.email.includes('@company.local')) {
            email = `${cardId}@company.local`;
        } else {
            email = user.email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            throw new Error(error.message);
        }

        // 3. Обновляем last_login
        await supabase
            .from('employees')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);

        return {
            user: data.user,
            session: data.session,
        };
    }

    static async getCurrentUser(): Promise<IUser & { auth_email: string } | null> {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();

        if (error) {
            console.error(error);
            return null;
        }

        if (!authUser) return null;

        const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .select('*')
            .eq('auth_id', authUser.id)
            .single();

        if (employeeError || !employeeData) {
            console.error(employeeError);
            return null;
        }

        // создаём новый объект с email из Supabase
        return {
            ...employeeData,
            auth_email: authUser.email
        };
    }


    static async changePassword(newPassword: string): Promise<boolean> {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('Not authenticated');
        }

        // 2. Меняем пароль
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            throw new Error('Password update failed');
        }

        await supabase
            .from('employees')
            .update({ updated_at: new Date().toISOString() })
            .eq('auth_id', user.id);

        return true;
    }


    static async logout() {
        await supabase.auth.signOut();
    }

    static async hasSession(): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    }

    static async updateEmail(newEmail: string): Promise<IUser & { auth_email: string } | null> {
        const { data: { user: authUser }, error: getUserError } = await supabase.auth.getUser();

        if (getUserError || !authUser) {
            throw new Error('User not found or not logged in');
        }

        const { data: updatedData, error: updateError } = await supabase.auth.updateUser({
            email: newEmail,
        });

        if (updateError || !updatedData.user) {
            throw new Error(updateError?.message || 'Failed to update email');
        }

        const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .update({email: newEmail})
            .select('*')
            .eq('auth_id', authUser.id)
            .single();

        if (employeeError || !employeeData) {
            throw new Error(employeeError?.message || 'Failed to get employee data');
        }

        return {
            ...employeeData,
            auth_email: updatedData.user.email || ''
        };
    }
}