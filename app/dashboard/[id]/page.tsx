'use client'
import React, {useEffect} from 'react';
import RobotListProvider from "@/components/shared/dashboard/robotsList/robotListProvider";
import {useUserStore} from "@/store/user";
import Important from "@/components/shared/dashboard/Important/Important";
import ImportantScreen from "@/components/shared/dashboard/Important/ImportantScreen";
import WaitingRepair from "@/components/shared/Robots/WaitingRepair";
import Link from "next/link";
import {AuthService} from "@/services/authService";
import UserAvatar from "@/components/shared/User/UserAvatar";

const Page = () => {
    const current_user  = useUserStore(state => state.currentUser)
    const isSession = AuthService.hasSession();

    useEffect(() => {
        if (!isSession) window.location.href = "/login";
    }, [isSession]);

    if (!current_user) {
        return <div>User not founded</div>
    }

    return (
        <div className={`p-4 flex flex-col gap-4`}>
            <div className={`flex flex-col gap-4`}>
                <div className={`flex items-center justify-between`}>
                    <div className={`flex items-center gap-2`}>
                        <UserAvatar user={current_user}/>
                        <Link href={`/users/profile`} className={`text-base text-primary font-bold hover:underline`}>{current_user.user_name}</Link>
                    </div>
                    <div className={`flex items-center gap-4`}>
                        <Important/>
                    </div>
                </div>
                <div className={`flex flex-col gap-2`}>
                    <ImportantScreen/>
                </div>
            </div>

            <div className={`grid md:grid-cols-2 gap-4`}>
                <div>
                    <WaitingRepair/>
                </div>
                <RobotListProvider card_id={current_user.card_id.toString()}/>
            </div>
        </div>
    );
};

export default Page;