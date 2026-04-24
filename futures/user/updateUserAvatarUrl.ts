import {supabase} from "@/lib/supabase/client";

export async function updateUserAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    const { error } = await supabase
        .from("employees")
        .update({ avatar_url: avatarUrl })
        .eq("auth_id", userId)

    if (error) throw new Error(error.message)
}