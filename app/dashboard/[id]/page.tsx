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
import WaitingRepair from "@/components/shared/Robots/WaitingRepair";
import {Separator} from "@/components/ui/separator";
import Link from "next/link";

const Page = () => {
    const params = useParams();
    const card_id = params?.id; // получаем динамический параметр

    const user_store = useUserStore(state => state.current_user)

    if (!user_store) return <LoaderCircle className={`animate-spin w-full`}/>

    return (
        <div className={`p-4 flex flex-col gap-4`}>
            <div className={`flex flex-col gap-4`}>
                <div className={`flex items-center justify-between`}>
                    <div className={`flex items-center gap-2`}>
                        <Link href={`/users/profile`} className={`text-base text-primary font-bold hover:underline`}>{user_store.user_name}</Link>
                    </div>
                    <div className={`flex items-center gap-4`}>
                        <UserStar size={24}/>
                        <Badge className={`text-base px-2`}
                               variant={user_store.score < 0 ? `destructive` : "secondary"}>
                            {user_store.score.toFixed(2)}
                        </Badge>
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
                    <Separator className={`my-4`} />
                    <div className={`hidden md:block`} >
                        <ShiftStats/>
                    </div>
                </div>
                <RobotListProvider card_id={card_id}/>
            </div>
        </div>
    );
};

export default Page;