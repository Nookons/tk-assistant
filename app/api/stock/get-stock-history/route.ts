import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const warehouse = searchParams.get('warehouse')

    try {
        let query = supabase
            .from('stock_history')
            .select(`
                *,
                user:employees!card_id(*),
                robot_data:robots_maintenance_list!id(*)
            `)

        if (warehouse) {
            query = query.eq('warehouse', warehouse)
        }

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