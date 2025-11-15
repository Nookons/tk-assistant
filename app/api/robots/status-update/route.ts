import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, new_status, card_id } = body;

        if (!id || !new_status || !card_id) {
            return NextResponse.json(
                { error: 'Missing required fields (id, new_status, card_id)' },
                { status: 400 }
            );
        }

        // Correct local time for UTC (remove timezone offset)
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60000;
        const updated_at = new Date(now.getTime() - offsetMs).toISOString().slice(0, -1);

        const { data, error } = await supabase
            .from('robots_maintance_list')
            .update({
                status: new_status,
                updated_at,
                updated_by: card_id,
            })
            .eq('id', id)
            .select()  // <-- ensures data is returned
            .single(); // <-- ensures you get one object instead of array

        console.log('Supabase data:', data);
        console.log('Supabase error:', error);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: 'Invalid JSON or server error' }, { status: 500 });
    }
}
