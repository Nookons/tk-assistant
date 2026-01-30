'use client'
import React from 'react';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useUserStore} from "@/store/user";
import {Progress} from "@/components/ui/progress";
import {CircleSlash, Contact, HardHat, IdCard, IdCardLanyard, LocateFixed, Rocket, Warehouse} from "lucide-react";
import {Badge} from "@/components/ui/badge";

const Page = () => {

    const user_store = useUserStore(state => state.current_user)

    if (!user_store) return null;

    return (
        <div className={`p-4 max-w-xl mx-auto bg-muted/25 rounded`}>
            <div className={`grid md:grid-cols-[150px_1fr] gap-4 items-center`}>
                <div>
                    <Avatar className={`w-full h-auto`}>
                        <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt="@shadcn"
                            className="grayscale"
                        />
                        <AvatarFallback>TK</AvatarFallback>
                    </Avatar>
                </div>
                <div className={`flex flex-col gap-2`}>
                    <div className={`flex items-center gap-2`}>
                        <Contact/>
                        <p>{user_store.user_name}</p>
                    </div>
                    <div className={`flex items-center gap-2`}>
                        <Warehouse/>
                        <p>{user_store.warehouse}</p>
                    </div>
                    <div className={`flex items-center gap-2`}>
                        <IdCardLanyard/>
                        <p>{user_store.card_id}</p>
                    </div>
                    <div className={`flex items-center gap-2`}>
                        <LocateFixed/>
                        <p>{user_store.position.toUpperCase()}</p>
                    </div>

                    <div className={`flex items-center gap-2`}>
                        <CircleSlash/>
                        <Progress value={user_store.score}/>
                        <Badge>1 Level</Badge>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Page;