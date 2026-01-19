import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {

    const { data, error } = await supabase
        .from('changed_parts')
        .select(`
                *,
                user:employees!card_id(user_name, card_id, email, phone, warehouse, position),
                robot:robots_maintenance_list!id(*)
            `)

    if (error) {
        console.error('Ошибка Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json(
            { message: `Records not found` },
            { status: 404 }
        );
    }

    // 3️⃣ Возвращаем найденного пользователя
    return NextResponse.json(data, { status: 200 });
}
