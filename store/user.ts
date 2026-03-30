import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IUser } from '@/types/user/user'

interface UserStore {
    currentUser: IUser | null
    setCurrentUser: (user: IUser | null) => void
    updateUser: (userData: Partial<IUser>) => void
    setActiveWarehouse: (warehouseId: number) => void
    clearUser: () => void
}

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            currentUser: null,

            setCurrentUser: (user) => set({ currentUser: user }),

            updateUser: (userData) => {
                const currentUser = get().currentUser
                if (currentUser) {
                    set({ currentUser: { ...currentUser, ...userData } })
                }
            },

            setActiveWarehouse: (warehouseId) => {
                const currentUser = get().currentUser
                if (currentUser) {
                    set({
                        currentUser: {
                            ...currentUser,
                            active_warehouse: warehouseId,
                        },
                    })
                }
            },

            clearUser: () => set({ currentUser: null }),
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({
                currentUser: state.currentUser
                    ? { ...state.currentUser, active_warehouse: null }
                    : null,
            }),
        }
    )
)

export const useCurrentUser = () => useUserStore((s) => s.currentUser)
export const useActiveWarehouse = () => useUserStore((s) => s.currentUser?.active_warehouse)
export const useUserRole = () => useUserStore((s) => s.currentUser?.role)