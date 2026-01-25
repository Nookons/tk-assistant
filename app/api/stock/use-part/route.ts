import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();

    const { value, warehouse, location, material_number, card_id} = body;

    const { data: existing, error: fetchError } = await supabase
        .from('stock')
        .select('*')
        .eq('warehouse', warehouse)
        .eq('location', location)
        .eq('material_number', material_number)
        .single();

    if (fetchError || !existing) {
        return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    const updatedData = {
        warehouse,
        location,
        material_number,
        quantity: existing.quantity - Number(value)
    };

    const { data, error } = await supabase
        .from('stock')
        .upsert(updatedData, {
            onConflict: 'warehouse,location,material_number',
            ignoreDuplicates: false
        })
        .select();

    const { data: HistoryData, error: HistoryError } = await supabase
        .from('stock_history')
        .insert({
            add_by: card_id,
            material_number,
            value: -value,
            warehouse,
            location
        })
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 200 });
}