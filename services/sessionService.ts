import { supabase } from '@/lib/supabase/client'
import {IUserSession} from "@/types/Session/Session";

export class SessionService {

    static async startSession(employeeId: number, homeWarehouse: number | null, warehouse_title: string): Promise<IUserSession | null> {
        if (!homeWarehouse) return null

        const { data: activeSub } = await supabase
            .from('worker_sessions')
            .select('*')                           // ← было только warehouse_id
            .eq('employee_id', employeeId)
            .lte('started_at', new Date().toISOString())
            .or(`ended_at.is.null,ended_at.gt.${new Date().toISOString()}`)
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (activeSub) return activeSub

        await supabase
            .from('worker_sessions')
            .update({ ended_at: new Date().toISOString(), status: 'closed' }) // ← статус тоже
            .eq('employee_id', employeeId)
            .is('ended_at', null)

        const { data: newSession, error } = await supabase
            .from('worker_sessions')
            .insert({
                employee_id: employeeId,
                warehouse_id: homeWarehouse,
                status: 'active',
                warehouse_sessions: warehouse_title,
            })
            .select('*')
            .single()

        if (error) throw new Error(`Error to create session: ${error.message}`)
        return newSession
    }

    static async getCurrentSession(auth_id: string): Promise<IUserSession | null> {
        const { data: user } = await supabase
            .from('employees')
            .select('id')
            .eq('auth_id', auth_id)
            .maybeSingle()

        if (!user) return null

        const { data: session, error } = await supabase
            .from('worker_sessions')
            .select('*, warehouse:warehouse_id(*)')
            .eq('employee_id', user.id)
            .eq('status', 'active')
            .order('started_at', { ascending: false })  // вместо created_at
            .limit(1)
            .maybeSingle()

        if (error) {
            throw new Error(`Ошибка загрузки сессии: ${error.message}`)
        }

        if (!session) return null

        if (session.ended_at && new Date(session.ended_at) < new Date()) {
            return null
        }

        return session as IUserSession
    }

    static async endSession(employeeId: number): Promise<void> {
        const { error } = await supabase
            .from('worker_sessions')
            .update({
                ended_at: new Date().toISOString(),
                status: 'inactive'
            })
            .eq('employee_id', employeeId)
            .eq('status', 'active')

        if (error) {
            throw new Error(`Ошибка закрытия сессии: ${error.message}`)
        }
    }
}