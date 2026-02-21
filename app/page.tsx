'use client'
import {useEffect} from "react";
import {useUserStore} from "@/store/user";
import {useRouter} from "next/navigation";

export default function Home() {
    const router = useRouter();
    const user = useUserStore(state => state.currentUser);

    useEffect(() => {
        if (user) router.push(`/dashboard/${user.auth_id}`);
    }, [user]);

    return null;
}