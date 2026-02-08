// store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from "@/types/user/user";

interface UserStore {
    currentUser: IUser | null;
    setCurrentUser: (user: IUser | null) => void;
    updateUser: (userData: Partial<IUser>) => void; // Новая функция
    clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            currentUser: null,
            setCurrentUser: (user) => set({ currentUser: user }),

            // Обновляет частично данные текущего пользователя
            updateUser: (userData) => {
                const currentUser = get().currentUser;
                if (currentUser) {
                    set({
                        currentUser: { ...currentUser, ...userData }
                    });
                }
            },

            clearUser: () => set({ currentUser: null }),
        }),
        {
            name: 'user-storage',
        }
    )
);