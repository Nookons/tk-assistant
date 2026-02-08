import React from 'react';
import {IUser} from "@/types/user/user";
import {User, Warehouse} from "lucide-react";

interface props {
    user: IUser | null | undefined;
}

const UserLoginPreviewL: React.FC<props> = ({user}) => {
    if (!user) return null;

    return (
        <div className={`flex flex-col gap-1`}>
            <div className={`flex items-center gap-2`}>
                <User size={16} />
                <p className={`font-bold`}>{user.user_name}</p>
            </div>
            <div className={`flex items-center gap-2`}>
                <Warehouse size={16} />
                <p className={`text-muted-foreground text-xs`}>{user.warehouse}</p>
            </div>
        </div>
    );
};

export default UserLoginPreviewL;