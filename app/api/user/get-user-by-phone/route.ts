import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
        return NextResponse.json(
            { error: 'Параметр "phone" обязателен' },
            { status: 400 }
        );
    }

    // 2️⃣ Запрос к таблице workers
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('card_id', phone)
        .maybeSingle(); // вернёт 1 запись или null

    if (error) {
        console.error('Ошибка Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json(
            { message: `Пользователь с телефоном ${phone} не найден` },
            { status: 404 }
        );
    }

    // 3️⃣ Возвращаем найденного пользователя
    return NextResponse.json(data, { status: 200 });
}
