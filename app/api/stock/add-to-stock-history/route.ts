import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();

    const { data: insertData, error: insertError } = await supabase
        .from('stock_history')
        .insert(body)
        .select()
        .maybeSingle();

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(insertData ?? { message: 'ok' }, { status: 201 });
}