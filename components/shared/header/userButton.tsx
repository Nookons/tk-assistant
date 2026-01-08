'use client'

import React, {useEffect, useCallback, useRef, FC, useState} from 'react';
import {Button} from "@/components/ui/button";
import {LayoutDashboard, LogIn, LogOut} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {IUser} from "@/types/user/user";
import {useUserStore} from "@/store/user";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton"; // Assuming you use a toast/notification library

// Define a separate interface for the component's props
interface UserButtonProps {
    setMobileMenuOpen: (value: boolean) => void;
}

// Custom Auth Event Typing (for TypeScript safety)
declare global {
    interface WindowEventMap {
        'authChange': CustomEvent<{ user: IUser | null }>;
    }
}

/**
 * Renders the authentication-related button (Login, Dashboard/Logout)
 * based on the current user state fetched from the API and global store.
 */
const UserButton: FC<UserButtonProps> = ({setMobileMenuOpen}) => {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(true);

    // --- REVISED: Accessing store state and actions individually ---
    const user = useUserStore(state => state.current_user);
    const set_user = useUserStore(state => state.set_user);
    // -----------------------------------------------------------------

    const mounted = useRef(true);

    /**
     * Fetches the current user from the API and updates the global store.
     */
    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me", {cache: "no-store"});

            if (!mounted.current) return;

            if (res.ok) {
                const data = await res.json();
                set_user(data.user || null);
            } else {
                set_user(null);
            }
        } catch (e) {
            console.error("Fetch user failed:", e);
            set_user(null);
        } finally {
            setIsLoading(false);
            mounted.current;
        }
    }, [set_user]);

    /**
     * Handles subscription to the custom 'authChange' event.
     */
    useEffect(() => {
        mounted.current = true;

        const handler = () => {
            console.log("Custom 'authChange' event received. Refetching user.");
            fetchUser();
        };

        fetchUser();

        window.addEventListener("authChange", handler);

        return () => {
            mounted.current = false;
            window.removeEventListener("authChange", handler);
        };
    }, [fetchUser]);

    /**
     * Handles the user logout process.
     */
    const handleLogout = async () => {

        try {
            const res = await fetch("/api/auth/logout", {method: "POST"});

            set_user(null); // Clear state immediately

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Logout failed:", errorText);
                toast.error("Logout failed due to an API error.");
            } else {
                toast.success("Successfully logged out.");
            }
        } catch (e) {
            console.error("Logout error:", e);
            toast.error("An unexpected error occurred during logout.");
        } finally {
        }

        router.push("/");
    }

    /**
     * Navigates the user to their specific dashboard page.
     */
    const goDashboard = () => {
        if (user?.card_id) {
            router.push(`/dashboard/${user.card_id}`);
            setMobileMenuOpen(false);
        }
    }

    // Don't render anything while the initial user status is being determined

    if (isLoading) return <Skeleton className="h-[30px] w-[100px] rounded" />;

    return user ? (
        // User is logged in: Show Dashboard and Logout buttons
        <div className="flex items-center justify-center gap-2">
            <Button onClick={goDashboard} variant="outline" title="Dashboard">
                <LayoutDashboard size={24}/>
            </Button>

            <Button onClick={handleLogout} variant="outline" title="Logout">
                <LogOut size={24}/>
            </Button>
        </div>
    ) : (
        // User is not logged in: Show Login button
        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline" title="Login">
                <LogIn size={24}/>
            </Button>
        </Link>
    );
};

export default UserButton;