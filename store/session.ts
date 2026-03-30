import { create } from 'zustand'
import { IUserSession } from '@/types/Session/Session'

interface SessionStore {
    currentSession: IUserSession | null
    setCurrentSession: (session: IUserSession | null) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
    currentSession: null,
    setCurrentSession: (session) => set({ currentSession: session }),
}))