import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    try {
        const robot_type = request.nextUrl.searchParams.get('robot_type');

        const { data, error } = await supabase
            .from('stock_items_template')
            .select('*')
            .contains('robot_match', [robot_type]);


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