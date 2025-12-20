import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { error: 'None id' },
            { status: 400 }
        );
    }

    // 2️⃣ Запрос к таблице workers
    const { data, error } = await supabase
        .from('changed_parts')
        .select(`
                *,
                user:employees!card_id(user_name, card_id, email, phone, warehouse, position),
                robot:robots_maintenance_list!id(*)
            `)
        .eq('id', id)
        .maybeSingle(); // вернёт 1 запись или null

    if (error) {
        console.error('Ошибка Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json(
            { message: `Record with id ${id} not found` },
            { status: 404 }
        );
    }

    // 3️⃣ Возвращаем найденного пользователя
    return NextResponse.json(data, { status: 200 });
}
