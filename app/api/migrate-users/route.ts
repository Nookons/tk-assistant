import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {

    // 1️⃣ берём всех сотрудников без auth_id
    const { data: employees, error } = await supabaseAdmin
        .from('employees')
        .select('*')
        .is('auth_id', null)

    if (error) {
        return NextResponse.json({ error }, { status: 500 })
    }

    const results = []

    for (const emp of employees) {

        const fakeEmail = `${emp.card_id}@company.local`
        const tempPassword = '123456'

        // 2️⃣ создаём auth user
        const { data: newUser, error: createError } =
            await supabaseAdmin.auth.admin.createUser({
                email: fakeEmail,
                password: tempPassword,
                email_confirm: true
            })

        if (createError) {
            results.push({ card_id: emp.card_id, error: createError.message })
            continue
        }

        // 3️⃣ связываем employees
        await supabaseAdmin
            .from('employees')
            .update({ auth_id: newUser.user.id })
            .eq('id', emp.id)

        results.push({
            card_id: emp.card_id,
            auth_id: newUser.user.id
        })
    }

    return NextResponse.json({
        migrated: results.length,
        results
    })
}
