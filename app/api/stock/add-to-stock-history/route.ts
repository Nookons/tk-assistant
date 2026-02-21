import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();

    const {add_by, material_number, value, warehouse, location} = body;

    // Если записи нет - создаем новую
    const { data: insertData, error: insertError } = await supabase
        .from('stock_history')
        .insert({
            add_by,
            material_number,
            value,
            warehouse,
            location
        })
        .select()
        .maybeSingle();

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(insertData ?? { message: 'ok' }, { status: 201 });
}