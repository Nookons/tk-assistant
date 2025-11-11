import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();

    const { shift_type, shift_date, employee_name, card_id, rt_kubot_exc, rt_kubot_mini, rt_kubot_e2, abnormal_locations, abnormal_cases } = body;

    const { data, error } = await supabase
        .from('shifts_list')
        .insert([{ shift_type, shift_date, employee_name, card_id, rt_kubot_exc, rt_kubot_mini, rt_kubot_e2, abnormal_locations, abnormal_cases}])
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? { message: 'ok' }, { status: 201 });
}
