import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { useUserStore } from "@/store/user"
import { Button } from "@/components/ui/button"
import { AuthService } from "@/services/authService"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

interface props {
    setIsPasswordChange: (value: boolean) => void;
}

const UserPasswordResetForm: React.FC<props> = ({ setIsPasswordChange }) => {
    const current_user = useUserStore(state => state.currentUser)

    const [passwords_data, setPasswords_data] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    })

    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    })

    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    if (!current_user) return null

    const handlePasswordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords_data({ ...passwords_data, [e.target.name]: e.target.value })
        setErrorMessage(null)
    }

    const toggleShowPassword = (field: 'old' | 'new' | 'confirm') => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
    }

    const handleSubmit = async () => {
        if (passwords_data.new_password !== passwords_data.confirm_password) {
            setErrorMessage("Passwords do not match");
            return;
        }

        try {
            setIsLoading(true);

            // Проверяем текущий пароль
            await AuthService.loginWithCard(current_user.card_id.toString(), passwords_data.old_password);

            // Меняем пароль
            await AuthService.changePassword(passwords_data.new_password);

            setPasswords_data({ old_password: '', new_password: '', confirm_password: '' });
            toast.success("Password has been changed successfully");
            setIsPasswordChange(false);

        } catch (err: any) {
            setErrorMessage(err.message || "Incorrect current password");
        } finally {
            setIsLoading(false);
        }
    }

    const renderPasswordInput = (name: 'old_password' | 'new_password' | 'confirm_password', placeholder: string, showField: 'old' | 'new' | 'confirm') => (
        <div className="relative w-full">
            <Input
                name={name}
                type={showPassword[showField] ? 'text' : 'password'}
                placeholder={placeholder}
                value={passwords_data[name]}
                onChange={handlePasswordsChange}
            />
            <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => toggleShowPassword(showField)}
            >
                {showPassword[showField] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
        </div>
    )

    return (
        <div className="w-full flex items-center gap-2 flex-wrap">
            {renderPasswordInput('old_password', 'Current Password', 'old')}
            {renderPasswordInput('new_password', 'New Password', 'new')}
            {renderPasswordInput('confirm_password', 'Confirm New Password', 'confirm')}

            {errorMessage && (
                <p className="text-sm text-red-500">
                    {errorMessage === "Invalid login credentials" ? 'Current password is wrong' : errorMessage}
                </p>
            )}

            <Button className={`w-full`} onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Changing..." : "Change Password"}
            </Button>
        </div>
    )
}

export default UserPasswordResetForm
