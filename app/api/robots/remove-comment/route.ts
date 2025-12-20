import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const body = await request.json();
    console.log('Полученные данные:', body);

    const {comment_id} = body;


    const { data, error } = await supabase
        .from('robots_comments')
        .delete()
        .eq('id', comment_id)

    console.log('Supabase data:', data);
    console.log('Supabase error:', error);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? { message: 'ok' }, { status: 201 });
}
