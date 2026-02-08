import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
    const { card_id, password } = await req.json()

    if (!card_id || !password) {
        return NextResponse.json({ error: 'Card ID and password required' }, { status: 400 })
    }

    // 1️⃣ Получаем employee
    const { data: employee, error: empErr } = await supabase
        .from('employees')
        .select('*')
        .eq('card_id', card_id)
        .single()

    if (empErr || !employee) {
        return NextResponse.json({ error: 'Invalid card ID' }, { status: 401 })
    }

    // 2️⃣ Логинимся через Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email: `${card_id}@company.local`,
        password
    })

    if (error || !data.session) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json({
        success: true,
        user: employee,
        session: data.session
    })
}
