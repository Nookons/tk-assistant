import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    const date = request.nextUrl.searchParams.get('date'); // 'YYYY-MM-DD'
    if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

    // создаём диапазон: с 00:00:00 до 23:59:59
    const startDate = `${date}T00:00:00Z`;
    const endDate = `${date}T23:59:59Z`;

    const { data, error } = await supabase
        .from('robots_maintance_list')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    if (error) {
        console.error('Error in Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ message: `Can't find any robots` }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
}
