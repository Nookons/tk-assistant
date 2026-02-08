import React from 'react';
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {IUser} from "@/types/user/user";

interface props {
    user: IUser;
}

const UserAvatar: React.FC<props> = ({user}) => {

    return (
        <Avatar className={`${!user.avatar_url && 'bg-white p-1'} w-10 h-10`}>
            <AvatarImage
                src={user.avatar_url ? user.avatar_url : "/img/img_none.svg"}
                alt="@tk_avatar"
            />
        </Avatar>
    );
};

export default UserAvatar;