import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { data, error } = await supabase
        .from('robots_maintenance_list')
        .select(`
            *,
            add_by:employees!add_by(*),
            updated_by:employees!updated_by(*),
            
            status_history:change_status_robots!robot_id(
                *,
                user:employees!add_by(*)
            ),
            
            
            parts_history:changed_parts!robot_id(
                *,
                user:employees!card_id(*),
                robot:robots_maintenance_list!id(*)
            )
        `)

    if (error) {
        console.error('Error in Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json(
            { message: `cant find any robots` },
            { status: 404 }
        );
    }

    // 3️⃣ Возвращаем найденного пользователя
    return NextResponse.json(data, { status: 200 });
}
