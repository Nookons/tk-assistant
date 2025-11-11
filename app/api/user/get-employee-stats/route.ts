import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const card_id = searchParams.get('card_id');

    const { data, error } = await supabase
        .from('employees_stats')
        .select('*')
        .eq("card_id", card_id)
        .maybeSingle(); // вернёт 1 запись или null

    if (error) {
        console.error('Error in Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json(
            { message: `cant find any users` },
            { status: 404 }
        );
    }

    // 3️⃣ Возвращаем найденного пользователя
    return NextResponse.json(data, { status: 200 });
}
