import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();
    console.log('Полученные данные:', body);

    const {card_id, material_number, description_orginall, description_eng, part_type} = body;

    const { data, error } = await supabase
        .from('stock_items_template')
        .insert({
            add_by: card_id,
            material_number,
            description_orginall,
            description_eng,
            part_type
        })
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? { message: 'ok' }, { status: 201 });
}