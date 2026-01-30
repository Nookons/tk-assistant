'use client'

import React, {useEffect, FC, useState} from 'react';
import {Button} from "@/components/ui/button";
import {LayoutDashboard, LogIn, LogOut} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useUserStore} from "@/store/user";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";
import {FetchUser} from "@/futures/user/FetchUser";
import {cn} from "@/lib/utils";
import dayjs from "dayjs";

interface UserButtonProps {
    setMobileMenuOpen: (value: boolean) => void;
}

const UserButton: FC<UserButtonProps> = ({setMobileMenuOpen}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const user = useUserStore(state => state.current_user);
    const set_user = useUserStore(state => state.set_user);


    const fetchUserFromCookie = async () => {
        try {
            const cookie_user = await FetchUser()
            console.log(cookie_user.user);
            set_user(cookie_user.user)

        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!user) {
            fetchUserFromCookie();
        } else (
            setIsLoading(false)
        )
    }, [user]);

    const handleNavigationClick = React.useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    const handleLogOut = async () => {

    }


    if (isLoading) return <Skeleton className="h-[30px] w-[100px] rounded"/>;

    return user ? (
        <div className="flex items-center justify-center gap-2">
            <Link
                key={`/dashboard/${dayjs().valueOf()}`}
                href={`/dashboard/${user.card_id}`}
                onClick={() => handleNavigationClick()}
            >
                <Button variant="outline" title="Dashboard">
                    <LayoutDashboard size={24}/>
                </Button>
            </Link>

            <Button variant="outline" title="Logout">
                <LogOut size={24}/>
            </Button>
        </div>
    ) : (
        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline" title="Login">
                <LogIn size={24}/>
            </Button>
        </Link>
    );
};

export default UserButton;