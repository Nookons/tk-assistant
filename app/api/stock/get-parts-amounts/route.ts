import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    try {
        const warehouse = request.nextUrl.searchParams.get('warehouse');
        const partNumber = request.nextUrl.searchParams.get('part_number');

        if (!warehouse || !partNumber) {
            throw new Error('warehouse or part_number is required');
        }

        let query = supabase
            .from('stock')
            .select(`*`)
            .eq('material_number', partNumber)
            .eq('warehouse', warehouse);


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