import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();

    const { data, error } = await supabase
        .from('changed_parts')
        .insert([{...body}])
        .select();

    const { data: robot_data, error: robot_error } = await supabase
        .from('robots_maintenance_list')
        .update({
            updated_at: new Date().toISOString(), // Use ISO string for consistency
            updated_by: body.card_id, // Use ISO string for consistency
        })
        .eq('id', body.robot_id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? { message: 'ok' }, { status: 201 });
}
