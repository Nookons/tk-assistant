import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    try {
        const robot_number = request.nextUrl.searchParams.get('robot_number');
        console.log(robot_number);

        if (!robot_number) {
            return NextResponse.json({ error: 'robot_number is required' }, { status: 400 });
        }

        // Получаем все ключи из другой таблицы
        const { data, error } = await supabase
            .from('exceptions_glpc')
            .select(`
                *,
                user:employees!add_by(user_name, card_id, email, phone, warehouse, position)
              `)
            .eq('error_robot', robot_number);


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
