export type UserRole = 'worker' | 'manager' | 'admin'

export type Employee = {
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
    auth_id: string | null
    password_changed: boolean
    must_change_password: boolean
    last_login_at: string | null
    is_active: boolean
    home_warehouse: number | null
    role: UserRole
}

export type ActiveEmployee = {
    id: number
    user_name: string
    card_id: number
    avatar_url: string | null
    position_title: string | null
    role: UserRole
    home_warehouse: number | null
    active_warehouse: number | null
    must_change_password: boolean
}

export type WorkerSession = {
    id: number
    employee_id: number
    warehouse_id: number
    type: 'home' | 'sub'
    started_at: string
    ended_at: string | null
    created_by: number | null
}

export type Action =
    | 'write_off:create'
    | 'write_off:view'
    | 'robot:edit'
    | 'warehouse:switch'
    | 'warehouse:view_all'
    | 'employees:manage'

export const PERMISSIONS: Record<UserRole, Action[]> = {
    worker: [
        'write_off:create',
        'write_off:view',
    ],
    manager: [
        'write_off:create',
        'write_off:view',
        'warehouse:switch',
        'warehouse:view_all',
    ],
    admin: [
        'write_off:create',
        'write_off:view',
        'robot:edit',
        'warehouse:switch',
        'warehouse:view_all',
        'employees:manage',
    ],
}

export function can(employee: Pick<ActiveEmployee, 'role'>, action: Action): boolean {
    return PERMISSIONS[employee.role]?.includes(action) ?? false
}