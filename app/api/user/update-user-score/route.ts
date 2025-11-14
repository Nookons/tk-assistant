import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        // 1️⃣ Получаем тело запроса
        const body = await request.json();
        const { card_id, value } = body; // возьми нужное поле из body

        if (card_id) {
            // Получаем текущее значение
            const { data: employee, error: selectError } = await supabase
                .from('employees')
                .select('score') // ← укажи нужное числовое поле
                .eq('card_id', card_id)
                .single();

            if (selectError) {
                console.error('Error selecting employee:', selectError);
                return NextResponse.json({ error: selectError.message }, { status: 500 });
            }

            // Вычисляем новое значение
            const newValue = (employee.score ?? 0) + Number(value);

            console.log(newValue);
            console.log(value);
            // Обновляем
            const { error: updateError } = await supabase
                .from('employees')
                .update({ score: newValue })
                .eq('card_id', card_id);

            if (updateError) {
                console.error('Error updating employees table:', updateError);
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }
        }

        // 4️⃣ Возвращаем успешный ответ
        return NextResponse.json(body, { status: 201 });

    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Invalid JSON or server error' }, { status: 400 });
    }
}
