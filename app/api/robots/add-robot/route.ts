import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();
    console.log('Полученные данные:', body);

    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const {card_id, robot_number, robot_type, type_problem, problem_note } = body;

    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000; // смещение в мс
    const updated_at = new Date(now.getTime() - offsetMs).toISOString().slice(0, -1);

    const { data, error } = await supabase
        .from('robots_maintance_list')
        .insert([{add_by: card_id, robot_number, robot_type, type_problem, problem_note, updated_at, status: "wait"}])
        .select();

    console.log('Supabase data:', data);
    console.log('Supabase error:', error);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? { message: 'ok' }, { status: 201 });
}
