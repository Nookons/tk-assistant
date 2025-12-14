'use client'
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IUser } from "@/types/user/user";
import { useUserStore } from "@/store/user";

const UserButton = () => {
    const router = useRouter();
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);

    const setUserStore = useUserStore(state => state.set_user);
    const mounted = useRef(true);

    /** Получение текущего пользователя */
    const fetchUser = useCallback(async () => {
        setLoading(true);

        try {
            const res = await fetch("/api/auth/me", { cache: "no-store" });

            if (!mounted.current) return; // защита от утечки после размонтирования

            if (!res.ok) {
                setUser(null);
                setUserStore(null);
                return;
            }

            const data = await res.json();

            setUser(data.user || null);
            setUserStore(data.user || null);

        } catch (e) {
            console.error("Fetch user failed:", e);
            setUser(null);
            setUserStore(null);
        } finally {
            mounted.current && setLoading(false);
        }
    }, [setUserStore]);

    /** Подписка на authChange + первый загрузочный вызов */
    useEffect(() => {
        mounted.current = true;

        const handler = () => fetchUser();
        window.addEventListener("authChange", handler);

        fetchUser();

        return () => {
            mounted.current = false;
            window.removeEventListener("authChange", handler);
        };
    }, [fetchUser]);

    /** Logout */
    const logout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (!res.ok) console.error("Logout failed:", await res.text());
        } catch (e) {
            console.error("Logout error:", e);
        }

        // моментально очищаем состояние
        setUser(null);
        setUserStore(null);

        router.push("/");
    }

    if (loading) return null;

    return user ? (
        <div className="flex items-center justify-center gap-2">
            <Link
                href={`/dashboard/${user.card_id}`}
            >
                <Button variant="outline">
                    <LayoutDashboard size={24} />
                </Button>
            </Link>

            <Button onClick={logout} variant="outline">
                <LogOut size={24} />
            </Button>
        </div>
    ) : (
        <Link
            href="/login"
        >
            <Button variant="outline">
                <LogIn size={24} />
            </Button>
        </Link>
    );
};

export default UserButton;
