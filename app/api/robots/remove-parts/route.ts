import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { parts_id } = body;

        if (!parts_id) {
            return NextResponse.json({ error: 'parts_id is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('changed_parts')
            .delete()
            .eq('id', parts_id)
            .select(); // Добавляем .select(), чтобы увидеть, что удалили

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Если данных нет, значит запись с таким ID не была найдена
        if (!data || data.length === 0) {
            return NextResponse.json({ message: 'Record not found' }, { status: 404 });
        }

        // Возвращаем удаленный объект
        return NextResponse.json(data[0], { status: 200 });

    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}