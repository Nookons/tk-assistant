import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();
    const {card_id, material_number, selected, warehouse, location, quantity} = body;

    const { data: existingData, error: searchError } = await supabase
        .from('stock')
        .select('*')
        .eq('warehouse', warehouse)
        .eq('material_number', material_number)
        .eq('location', location)
        .single();

    if (searchError && searchError.code !== 'PGRST116') {
        return NextResponse.json({ error: searchError.message }, { status: 500 });
    }

    let result;

    if (existingData) {
        const newQuantity = (Number(existingData.quantity) || 0) + Number(quantity);

        const { data: updateData, error: updateError } = await supabase
            .from('stock')
            .update({
                quantity: newQuantity,
                last_update_by: card_id
            })
            .eq('id', existingData.id)
            .select();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        result = updateData?.[0];
    } else {
        const { data: insertData, error: insertError } = await supabase
            .from('stock')
            .insert({
                last_update_by: card_id,
                material_number,
                selected,
                warehouse,
                location,
                quantity
            })
            .select();

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        result = insertData?.[0];
    }

    return NextResponse.json(result ?? { message: 'ok' }, { status: 201 });
}