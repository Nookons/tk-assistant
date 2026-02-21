import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const auth_id = searchParams.get('auth_id');

    if (!auth_id) {
        return NextResponse.json(
            { error: 'Param "auth_id" is required' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('auth_id', auth_id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json(
            { message: `User with ${auth_id} no exist` },
            { status: 404 }
        );
    }

    return NextResponse.json(data, { status: 200 });
}
