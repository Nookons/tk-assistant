'use client'
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IUser } from "@/types/user/user";

const UserButton = () => {
    const router = useRouter();
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Проверяем токен и получаем данные пользователя с сервера
    const fetchUser = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data.user || null);
            } else {
                setUser(null); // не авторизован
            }
        } catch (err) {
            console.error("Fetch user failed:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    // Logout
    const logout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (!res.ok) console.error("Logout failed:", await res.text());
        } catch (err) {
            console.error(err);
        }
        setUser(null); // очищаем состояние
        router.push("/"); // редирект на главную
    }

    if (loading) return null; // можно показать спиннер

    return user ? (
        <div className="flex items-center justify-center gap-2">
            {/* Dashboard */}
            <Link href={`/dashboard/${user.card_id}`}>
                <Button variant="outline">
                    <LayoutDashboard size={24} />
                </Button>
            </Link>

            {/* Logout */}
            <Button onClick={logout} variant="outline">
                <LogOut size={24} />
            </Button>
        </div>
    ) : (
        <Link href="/login">
            <Button variant="outline">
                <LogIn size={24} />
            </Button>
        </Link>
    );
};

export default UserButton;
