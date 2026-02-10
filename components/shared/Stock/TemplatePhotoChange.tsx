import React, {useRef, useState} from 'react';
import {Loader2, Upload} from "lucide-react";
import {Input} from "@/components/ui/input";
import {useUserStore} from "@/store/user";
import {toast} from "sonner";
import {StorageService} from "@/services/storageService";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {useStockStore} from "@/store/stock";
import {Button} from "@/components/ui/button";

interface props {
    part: IStockItemTemplate;
}

const TemplatePhotoChange: React.FC<props> = ({part}) => {
    const user = useUserStore(state => state.currentUser)
    const updateItemTemplate = useStockStore(state => state.update_item_template)

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!part || !user) return null

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]

        if (!validateFile(file)) return

        const previewUrl = URL.createObjectURL(file)
        setSelectedFile(file)

        await handleUpload(file, previewUrl)
    }

    const validateFile = (file: File): boolean => {
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error("File is too large. Maximum size is 5MB")
            return false
        }

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
            const avatarUrl = await StorageService.uploadTemplateImage(file, user.auth_id)
            await StorageService.updatePartAvatarUrl(part.id.toString(), avatarUrl)

            toast.success("Image updated successfully!")

            updateItemTemplate(part.id.toString(), {
                avatar_url: avatarUrl,
                updated_at: Number(new Date().toISOString())
            })

            URL.revokeObjectURL(previewUrl)
            setSelectedFile(null)

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

        } catch (err: any) {
            console.error('Error uploading avatar:', err)
            toast.error(err?.message || "Failed to upload image")
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
        <div className="flex flex-col gap-3">
            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
            />

            <Button
                onClick={handleChooseFileClick}
                disabled={isUploading}
                variant="ghost"
                size={`sm`}
                className="w-full"
            >
                {isUploading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose new image
                    </>
                )}
            </Button>

            {selectedFile && !isUploading && (
                <div className="text-xs text-center text-muted-foreground bg-muted/50 p-2 rounded">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            )}

            {isUploading && (
                <div className="text-center">
                    <p className="text-sm text-muted-foreground animate-pulse mb-2">
                        Uploading image...
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Please don't close the page
                    </p>
                </div>
            )}
        </div>
    )
};

export default TemplatePhotoChange;