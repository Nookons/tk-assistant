import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const { card_id, oldPassword, newPassword } = await request.json();

        if (!card_id || !oldPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Все поля обязательны: card_id, oldPassword, newPassword' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Пароль должен быть минимум 6 символов' },
                { status: 400 }
            );
        }

        // Получаем пользователя и текущий пароль
        const { data: user, error: fetchError } = await supabase
            .from('employees')
            .select('id, password')
            .eq('card_id', card_id)
            .maybeSingle();

        if (fetchError) {
            console.error('Ошибка Supabase:', fetchError);
            return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
        }

        if (!user) {
            return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
        }

        // Проверяем старый пароль
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return NextResponse.json({ error: 'Старый пароль неверен' }, { status: 401 });
        }

        // Хешируем новый пароль
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Обновляем пароль в БД
        const { error: updateError } = await supabase
            .from('employees')
            .update({ password: passwordHash })
            .eq('card_id', card_id);

        if (updateError) {
            console.error('Ошибка обновления:', updateError);
            return NextResponse.json({ error: 'Ошибка обновления пароля' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Пароль успешно изменён' }, { status: 200 });

    } catch (error) {
        console.error('Ошибка сервера:', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}
