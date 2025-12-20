import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();
    const {parts, card_id, robot_id } = body;

    const { data, error } = await supabase
        .from('changed_parts')
        .insert([{parts_numbers: parts, card_id, robot_id}])
        .select();

    // --- 4. Update Current Robot Status (Primary Table) ---
    const { data: robot_data, error: robot_error } = await supabase
        .from('robots_maintenance_list')
        .update({
            updated_at: new Date().toISOString(), // Use ISO string for consistency
            updated_by: card_id, // Use ISO string for consistency
        })
        .eq('id', robot_id)
        .select()
        .single();

    console.log('Supabase data:', data);
    console.log('Supabase error:', error);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? { message: 'ok' }, { status: 201 });
}
