import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    try {
        const robot_id = request.nextUrl.searchParams.get('robot_id');

        if (!robot_id) {
            return NextResponse.json({ error: 'robot_id is required' }, { status: 400 });
        }

        // Получаем все ключи из другой таблицы
        const { data, error } = await supabase
            .from('robots_comments')
            .select(`
                *,
                employees(*)   -- users это таблица с юзерами, связанная по user_id
              `)
            .eq('robot_record', robot_id);


        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
