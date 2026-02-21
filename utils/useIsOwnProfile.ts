import {useUserStore} from "@/store/user";

export const useIsOwnProfile = (profileAuthId?: string): boolean => {
    const currentUser = useUserStore(state => state.currentUser);
    if (!currentUser || !profileAuthId) return false;
    return currentUser.auth_id === profileAuthId;
};