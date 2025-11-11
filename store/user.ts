import { create } from 'zustand'
import { IUser } from '@/types/user/user'

type UserState = {
    current_user: IUser | null
    set_user: (user: IUser | null) => void
}

export const useUserStore = create<UserState>((set) => ({
    current_user: null,

    set_user: (user) => set({ current_user: user }),
}))
