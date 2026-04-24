import {supabase} from "@/lib/supabase/client";

export async function uploadAvatarToSupabase(file: File, userId: string): Promise<string> {
    const ext = file.name.split(".").pop()
    const filePath = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

    if (uploadError) throw new Error(uploadError.message)

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
    return `${data.publicUrl}?t=${Date.now()}`
}