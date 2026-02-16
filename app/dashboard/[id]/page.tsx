'use client'
import React from 'react';
import RobotListProvider from "@/components/shared/dashboard/robotsList/robotListProvider";
import {useUserStore} from "@/store/user";
import Important from "@/components/shared/dashboard/Important/Important";
import ImportantScreen from "@/components/shared/dashboard/Important/ImportantScreen";
import WaitingRepair from "@/components/shared/Robots/WaitingRepair";
import Link from "next/link";
import UserAvatar from "@/components/shared/User/UserAvatar";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {CheckCircle2Icon} from "lucide-react";

const Page = () => {
    const current_user  = useUserStore(state => state.currentUser)

    if (!current_user) {
        return <div>User not founded</div>
    }

    return (
        <div className={`p-4 flex flex-col gap-4`}>
            <div className={`flex flex-col gap-4`}>
                <div className={`flex items-center justify-between`}>
                    <div className={`flex items-center gap-2`}>
                        <UserAvatar user={current_user}/>
                        <div className={`flex flex-col`}>
                            <Link href={`/users/profile`} className={`text-base text-primary font-bold hover:underline`}>{current_user.user_name}</Link>
                            <p className={`text-xs text-muted-foreground`}>{current_user.warehouse}</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-4`}>
                        <Important/>
                    </div>
                </div>
            </div>

            {(current_user.warehouse.includes("GLPC") ||
                current_user.warehouse.includes("TK CEE")) && (
                <div>
                    <div className="flex flex-col gap-2">
                        <ImportantScreen />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <WaitingRepair />
                        </div>

                        <RobotListProvider
                            card_id={current_user.card_id.toString()}
                        />
                    </div>
                </div>
            )}


            {current_user.warehouse.includes("PNT") && (
                <Alert>
                    <CheckCircle2Icon />
                    <AlertTitle>PNT DASHBOARD</AlertTitle>
                    <AlertDescription>
                        Dashboard for PNT still under working, please try again later...
                    </AlertDescription>
                </Alert>
            )}

            {current_user.warehouse.includes("S P3") && (
                <Alert>
                    <CheckCircle2Icon />
                    <AlertTitle>S P3 DASHBOARD</AlertTitle>
                    <AlertDescription>
                        Dashboard for S P3 still under working, please try again later...
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default Page;