'use client'

import { useEffect } from 'react'
import { IUserSession } from '@/types/Session/Session'
import {useSessionStore} from "@/store/session";

export function SessionProvider({ session }: { session: IUserSession }) {
    const setCurrentSession = useSessionStore(s => s.setCurrentSession)

    useEffect(() => {
        setCurrentSession(session)
    }, [session])

    return null
}