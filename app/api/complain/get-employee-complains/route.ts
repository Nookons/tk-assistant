import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const card_id = searchParams.get('card_id');

    if (!card_id) {
        return NextResponse.json(
            { error: 'card_id is required' },
            { status: 400 }
        );
    }

    // 2️⃣ Запрос к таблице workers
    const { data, error } = await supabase
        .from('complain_list')
        .select('*')
        .eq('card_id', card_id)

    if (error) {
        console.error('Ошибка Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json(
            { message: `Пользователь с card_id ${card_id} не найден` },
            { status: 404 }
        );
    }

    // 3️⃣ Возвращаем найденного пользователя
    return NextResponse.json(data, { status: 200 });
}
