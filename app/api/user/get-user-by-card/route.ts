import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const card_id = searchParams.get('card_id');

    if (!card_id) {
        return NextResponse.json(
            { error: 'Param "card_id" is required' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('card_id', card_id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json(
            { message: `User with ${card_id} no exist` },
            { status: 404 }
        );
    }

    return NextResponse.json(data, { status: 200 });
}
