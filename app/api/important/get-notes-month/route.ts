import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // YYYY-MM

        if (!month) {
            return NextResponse.json(
                { error: 'Month parameter is required (YYYY-MM)' },
                { status: 400 }
            );
        }

        const startDate = new Date(`${month}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const { data, error } = await supabase
            .from('important_notes')
            .select(`
        *,
        user:employees!add_by(
          user_name,
          card_id,
          email,
          phone,
          warehouse,
          position
        )
      `)
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString());

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data ?? [], { status: 200 });

    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
