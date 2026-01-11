'use client'
import React from 'react';
import {useParams} from "next/navigation";
import {Badge} from "@/components/ui/badge";
import RobotListProvider from "@/components/shared/dashboard/robotsList/robotListProvider";
import {LoaderCircle, UserStar} from "lucide-react";
import {Label} from "@/components/ui/label";
import ShiftStats from "@/components/shared/dashboard/ShiftStats/ShiftStats";
import {useUserStore} from "@/store/user";
import Important from "@/components/shared/dashboard/Important/Important";
import ImportantScreen from "@/components/shared/dashboard/Important/ImportantScreen";

const Page = () => {
    const params = useParams();
    const card_id = params?.id; // получаем динамический параметр

    const user_store = useUserStore(state => state.current_user)

    if (!user_store) return <LoaderCircle className={`animate-spin w-full`}/>

    return (
        <div className={`px-4 flex flex-col gap-4 max-w-[1600px] m-auto`}>
            <div className={`flex items-center justify-between mt-4`}>
                <div className={`flex items-center gap-2`}>
                    <Label className={`text-base`}>{user_store.user_name}</Label>
                </div>
                <div className={`flex items-center gap-4`}>
                    <UserStar size={24}/>
                    <Badge className={`text-base px-2`} variant={user_store.score < 0 ? `destructive` : "secondary"}>
                        {user_store.score.toFixed(2)}
                    </Badge>
                    <Important />
                </div>
            </div>

            <div className={`flex flex-col gap-2`}>
                <ImportantScreen />
            </div>

            <div className={``}>
                <RobotListProvider card_id={card_id}/>
                <ShiftStats />
            </div>
        </div>
    );
};

export default Page;