import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();
    console.log('Полученные данные:', body);

    const {add_by, shift_type, device_type, employee, error_end_time, error_robot, error_start_time, first_column, issue_description, issue_type, recovery_title, second_column, solving_time, uniq_key } = body;

    const { data, error } = await supabase
        .from('exceptions_glpc')
        .insert([{ add_by, shift_type, device_type, employee, error_end_time, error_robot, error_start_time, first_column, issue_description, issue_type, recovery_title, second_column, solving_time, uniq_key  }])
        .select();

    console.log('Supabase data:', data);
    console.log('Supabase error:', error);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? { message: 'ok' }, { status: 201 });
}
