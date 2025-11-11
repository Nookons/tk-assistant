// Для первой установки пароля администратором
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const { phone, password } = await request.json();

        if (!phone || !password) {
            return NextResponse.json(
                { error: 'Параметры "phone" и "password" обязательны' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Пароль должен быть минимум 6 символов' },
                { status: 400 }
            );
        }

        // Хешируем пароль
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Обновляем или создаём запись
        const { error } = await supabase
            .from('employees')
            .update({ password_hash: passwordHash })
            .eq('phone', phone);

        if (error) {
            console.error('Ошибка обновления:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Пароль успешно установлен'
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Ошибка сервера:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}