import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();
    const { card_id, robot_id, updateFields } = body;

    // --- 2. Update Robot with dynamic fields ---
    const defaultUpdate = {
        updated_at: new Date().toISOString(),
        updated_by: card_id,
    };

    // Merge default fields with custom fields from request
    const updateData = {
        ...defaultUpdate,
        ...(updateFields || {}), // Add any additional fields from request
    };

    const { data: robot_data, error: robot_error } = await supabase
        .from('robots_maintenance_list')
        .update(updateData)
        .eq('id', robot_id)
        .select()
        .single();


    if (robot_error) {
        return NextResponse.json({ error: robot_error.message }, { status: 500 });
    }

    return NextResponse.json(
        {
            robot: robot_data,
            message: 'ok'
        },
        { status: 201 }
    );
}