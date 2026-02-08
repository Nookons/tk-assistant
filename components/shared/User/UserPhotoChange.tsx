'use client'

import React, { useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/store/user"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { StorageService } from "@/services/storageService"
import { Camera, Loader2 } from "lucide-react"

const UserPhotoChange = () => {
    const user = useUserStore(state => state.currentUser)
    const updateUser = useUserStore(state => state.updateUser) // Проверьте, есть ли такая функция в вашем store

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!user) return null

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]

        if (!validateFile(file)) return

        // Создаем preview
        const previewUrl = URL.createObjectURL(file)
        setSelectedFile(file)
        setPreview(previewUrl)

        // Автоматически загружаем файл при выборе
        await handleUpload(file, previewUrl)
    }

    const validateFile = (file: File): boolean => {
        // Проверка размера (максимум 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error("File is too large. Maximum size is 5MB")
            return false
        }

        // Проверка типа файла
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            toast.error("Invalid file type. Please use JPEG, PNG, WebP or GIF")
            return false
        }

        return true
    }

    const handleUpload = async (file: File, previewUrl: string) => {
        if (!user?.auth_id) {
            toast.error("User not found")
            return
        }

        setIsUploading(true)

        try {
            const avatarUrl = await StorageService.uploadUserAvatar(file, user.auth_id)
            await StorageService.updateUserAvatarUrl(user.auth_id, avatarUrl)

            updateUser({ ...user, avatar_url: avatarUrl })
            toast.success("Avatar updated successfully!")

            URL.revokeObjectURL(previewUrl) // Освобождаем память
            setPreview(null)
            setSelectedFile(null)

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

        } catch (err: any) {
            console.error('Error uploading avatar:', err)
            toast.error(err?.message || "Failed to upload avatar")

            setPreview(null)
            URL.revokeObjectURL(previewUrl)
        } finally {
            setIsUploading(false)
        }
    }

    const handleChooseFileClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click()
        }
    }

    return (
        <div className="flex relative flex-col items-center gap-4 rounded-lg bg-background max-w-sm mx-auto">
            <div className="relative group">
                <Avatar className="w-28 h-28 rounded">
                    <AvatarImage
                        src={preview || user.avatar_url || "/img/img_none.svg"}
                        alt="User Avatar"
                        className="object-cover"
                    />
                    {!user.avatar_url && !preview && <AvatarFallback>TK</AvatarFallback>}
                </Avatar>

                {/* Индикатор загрузки */}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                )}

                {/* Иконка камеры при наведении (только если не загружается) */}
                {!isUploading && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded transition-opacity flex items-center justify-center cursor-pointer"
                         onClick={handleChooseFileClick}>
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>

            {/* Скрытый input для выбора файла */}
            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
            />

            {/* Информация о выбранном файле */}
            {selectedFile && !isUploading && (
                <div className="text-sm text-center">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                </div>
            )}

            {/* Сообщение о загрузке */}
            {isUploading && (
                <div className="text-center">
                    <p className="text-sm text-muted-foreground animate-pulse mb-2">
                        Uploading avatar...
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Please don't close the page
                    </p>
                </div>
            )}
        </div>
    )
}

export default UserPhotoChange