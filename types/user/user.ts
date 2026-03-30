export type UserRole = 'worker' | 'manager' | 'admin'

export interface IUser {
    id: number
    created_at: string
    updated_at: string | null
    user_name: string
    card_id: number
    email: string | null
    phone: number | null
    warehouse: string | null
    score: number | null
    position: string | null
    position_title: string | null
    avatar_url: string | null
    auth_id: string
    last_login_at: string | null
    is_active: boolean
    password_changed: boolean
    must_change_password: boolean
    home_warehouse: number | null
    role: UserRole

    // Не в БД — вычисляется при входе из worker_sessions
    active_warehouse: number | null
}