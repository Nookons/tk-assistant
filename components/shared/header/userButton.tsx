'use client'

import React, { FC, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { LayoutDashboard, LogIn, LogOut } from "lucide-react"
import Link from "next/link"
import { useUserStore } from "@/store/user"
import { AuthService } from "@/services/authService"

interface UserButtonProps {
    setMobileMenuOpen: (value: boolean) => void
}

const UserButton: FC<UserButtonProps> = ({ setMobileMenuOpen }) => {
    const current_user = useUserStore(state => state.currentUser)

    const [isSession, setIsSession] = useState<boolean | null>(null)

    useEffect(() => {
        const checkSession = async () => {
            const session = await AuthService.hasSession()
            setIsSession(session)
        }

        checkSession()
    }, [current_user])

    const handleLogOut = async () => {
        await AuthService.logout()
        window.location.href = "/login"
    }

    if (isSession === null || !current_user) {
        return <div>Loading...</div>
    }

    return isSession ? (
        <div className="flex items-center gap-2">
            <Link href={`/dashboard/${current_user.auth_id}`}>
                <Button variant="ghost" title="Dashboard">
                    <LayoutDashboard size={24} />
                </Button>
            </Link>

            <Button variant="ghost" title="Logout" onClick={handleLogOut}>
                <LogOut size={24} />
            </Button>
        </div>
    ) : (
        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" title="Login">
                <LogIn size={24} />
            </Button>
        </Link>
    )
}

export default UserButton
