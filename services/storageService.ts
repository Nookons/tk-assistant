import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export class StorageService {
    static async uploadTemplateImage(file: File, templateId: string): Promise<string> {
        try {
            const fileExtension = file.name.split('.').pop() || 'jpg';
            const timestamp = Date.now();
            const fileName = `template_${templateId}_${timestamp}.${fileExtension}`;

            const bucketName = 'parts';
            const filePath = fileName;

            const maxSize = 5 * 1024 * 1024; // 5MB

            if (file.size > maxSize) {
                throw new Error('File size too large. Maximum size is 5MB');
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

            if (!allowedTypes.includes(file.type.toLowerCase())) {
                throw new Error('Invalid file type. Please use JPEG, PNG, WebP or GIF');
            }

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                throw new Error(`Failed to upload to storage: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Template image upload error:', error);
            throw error;
        }
    }

    static async uploadUserAvatar(file: File, userId: string): Promise<string> {
        try {
            const fileExtension = file.name.split('.').pop() || 'jpg';
            const timestamp = Date.now();
            const fileName = `${userId}_${timestamp}.${fileExtension}`;
            const filePath = `${userId}/${fileName}`; // Сохраняем в подпапке пользователя

            // Валидация
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error('File size too large. Maximum size is 5MB');
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
            if (!allowedTypes.includes(file.type.toLowerCase())) {
                throw new Error('Invalid file type. Please use JPEG, PNG, WebP or GIF');
            }

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return publicUrl;

        } catch (error) {
            console.error('User avatar upload error:', error);
            throw error;
        }
    }

    static async updateUserAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
        const { error } = await supabase
            .from('employees')
            .update({
                avatar_url: avatarUrl,
                updated_at: dayjs().utc().toISOString()
            })
            .eq('auth_id', userId);

        if (error) {
            throw new Error(`Failed to update user avatar URL: ${error.message}`);
        }
    }

    static async updatePartAvatarUrl(partId: string, avatarUrl: string): Promise<void> {
        try {
            console.log('Updating part avatar URL:', { partId, avatarUrl });

            const { error } = await supabase
                .from('stock_items_template')
                .update({
                    avatar_url: avatarUrl,
                    updated_at: dayjs().utc().toISOString()
                })
                .eq('id', partId);

            if (error) {
                console.error('Database update error details:', error);

                // Пробуем обновить через RPC функцию
                const { error: rpcError } = await supabase.rpc('update_template_avatar', {
                    template_id: partId,
                    avatar_url: avatarUrl
                });

                if (rpcError) {
                    throw new Error(`Failed to update part avatar URL: ${error.message}`);
                }
            }

            console.log('Part avatar updated successfully');
        } catch (error) {
            console.error('Update part avatar error:', error);
            throw error;
        }
    }
}