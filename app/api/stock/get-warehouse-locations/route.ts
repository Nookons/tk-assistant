import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const warehouse = searchParams.get('warehouse');

        if (!warehouse) {
            return NextResponse.json(
                { error: 'warehouse is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('stock')
            .select('location')
            .eq('warehouse', warehouse);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const uniqueLocations = [
            ...new Set(data.map(item => item.location))
        ];

        return NextResponse.json(uniqueLocations, { status: 200 });

    } catch (err) {
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}
