import React, { useRef, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { IUser } from "@/types/user/user"
import { Pencil, Loader2, Maximize2, X } from "lucide-react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/user"
import { uploadAvatarToSupabase } from "@/futures/user/uploadAvatarToSupabase"
import { updateUserAvatarUrl } from "@/futures/user/updateUserAvatarUrl"
import {toast} from "sonner";

interface Props {
    user: IUser
    isEdit?: boolean
    allowFullscreen?: boolean
    onAvatarUpdate?: (newUrl: string) => void
}

const UserAvatar: React.FC<Props> = ({user, isEdit = false, allowFullscreen = false, onAvatarUpdate}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [preview, setPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [fullscreenOpen, setFullscreenOpen] = useState(false)

    const updateUserStore = useUserStore((state) => state.updateUser)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Maximum size is 5 MB.")
            return
        }

        setSelectedFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleSave = async () => {
        if (!selectedFile || !user.id) return

        setIsLoading(true)
        try {
            const publicUrl = await uploadAvatarToSupabase(selectedFile, user.auth_id)
            await updateUserAvatarUrl(user.auth_id, publicUrl)

            onAvatarUpdate?.(publicUrl)
            updateUserStore({ avatar_url: publicUrl })
            setEditOpen(false)
            toast.success(`You avatar updated successfully! It may take a time 5-10m to you see the changes`)
        } catch (err) {
            console.error("Avatar upload error:", err)
            alert("Failed to upload avatar. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditOpenChange = (val: boolean) => {
        setEditOpen(val)
        if (!val) {
            setPreview(null)
            setSelectedFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const currentAvatar = preview ?? user.avatar_url ?? "/img/img_none.svg"

    return (
        <div className={`relative`}>
            <div className="relative w-full h-full group">
                <Avatar className={`w-full h-full rounded-none ${!user.avatar_url ? "bg-white p-1" : ""}`}>
                    <AvatarImage src={currentAvatar} alt="User avatar" />
                    <AvatarFallback>{user.user_name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>

                {(isEdit || allowFullscreen) && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {allowFullscreen && (
                            <button
                                type="button"
                                onClick={() => setFullscreenOpen(true)}
                                className="text-white hover:text-white/70 transition-colors cursor-pointer"
                                aria-label="View fullscreen"
                            >
                                <Maximize2 className="w-5 h-5" />
                            </button>
                        )}

                        {isEdit && (
                            <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
                                <DialogTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-white hover:text-white/70 transition-colors cursor-pointer"
                                        aria-label="Edit avatar"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                </DialogTrigger>

                                <DialogContent className="sm:max-w-sm">
                                    <DialogHeader>
                                        <DialogTitle>Change Avatar</DialogTitle>
                                        <DialogDescription>
                                            Select a new profile photo. Maximum size — 5 MB.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex flex-col items-center gap-4 py-2">
                                        <Avatar className="w-24 h-24">
                                            <AvatarImage src={currentAvatar} alt="Preview" />
                                            <AvatarFallback>{user.user_name?.[0] ?? "U"}</AvatarFallback>
                                        </Avatar>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />

                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Choose photo
                                        </Button>

                                        {selectedFile && (
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {selectedFile.name}
                                            </p>
                                        )}
                                    </div>

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={isLoading}>
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button onClick={handleSave} disabled={!selectedFile || isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save changes"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                )}
            </div>

            {allowFullscreen && fullscreenOpen && (
                <div
                    className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 bg-background/50 backdrop-blur-sm"
                    onClick={() => setFullscreenOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setFullscreenOpen(false)}
                        className="absolute top-4 right-4 text-white hover:text-white/70 transition-colors"
                        aria-label="Close fullscreen"
                    >
                        <X className="w-7 h-7" />
                    </button>

                    <img
                        src={currentAvatar}
                        alt="Avatar fullscreen"
                        className="max-w-[90vw] max-h-[70vh] rounded-2xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    )
}

export default UserAvatar