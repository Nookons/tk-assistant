import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    try {
        const robot_id = request.nextUrl.searchParams.get('robot_id');

        let query = supabase
            .from('robots_maintance_list')
            .select(`
                *,
                add_by:employees!add_by(user_name, card_id, email, phone, warehouse, position),
                updated_by:employees!updated_by(user_name, card_id, email, phone, warehouse, position)
            `).eq('id', robot_id).single();


        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}