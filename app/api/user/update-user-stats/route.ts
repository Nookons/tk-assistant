import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();
    console.log('Полученные данные:', body);

    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { card_id, rt_kubot_exc, rt_kubot_mini, rt_kubot_e2, abnormal_locations, abnormal_cases } = body;

    // Проверка наличия card_id
    if (!card_id) {
        return NextResponse.json({ error: 'card_id is required' }, { status: 400 });
    }

    // Сначала получаем текущие значения
    const { data: existing, error: fetchError } = await supabase
        .from('employees_stats')
        .select('rt_kubot_exc, rt_kubot_mini, rt_kubot_e2, abnormal_locations, abnormal_cases')
        .eq('card_id', card_id)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = не найдено
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000; // смещение в мс
    const localISOTime = new Date(now.getTime() - offsetMs).toISOString().slice(0, -1);

    // Вычисляем новые значения (добавляем к существующим)
    const updatedData = {
        card_id,
        updated_at: localISOTime,
        rt_kubot_exc: (existing?.rt_kubot_exc || 0) + (rt_kubot_exc || 0),
        rt_kubot_mini: (existing?.rt_kubot_mini || 0) + (rt_kubot_mini || 0),
        rt_kubot_e2: (existing?.rt_kubot_e2 || 0) + (rt_kubot_e2 || 0),
        abnormal_locations: (existing?.abnormal_locations || 0) + (abnormal_locations || 0),
        abnormal_cases: (existing?.abnormal_cases || 0) + (abnormal_cases || 0)
    };

    // Upsert с новыми значениями
    const { data, error } = await supabase
        .from('employees_stats')
        .upsert(updatedData, {
            onConflict: 'card_id',
            ignoreDuplicates: false
        })
        .select();

    console.log('Supabase data:', data);
    console.log('Supabase error:', error);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 200 });
}