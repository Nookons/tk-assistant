import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const { card_id, password } = await request.json();

        // Валидация
        if (!card_id || !password) {
            return NextResponse.json(
                { error: 'Параметры "card_id" и "password" обязательны' },
                { status: 400 }
            );
        }

        // Получаем пользователя из БД
        const { data: user, error: fetchError } = await supabase
            .from('employees')
            .select('*')
            .eq('card_id', card_id)
            .maybeSingle();

        if (fetchError) {
            console.error('Ошибка Supabase:', fetchError);
            return NextResponse.json(
                { error: fetchError.message },
                { status: 500 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Неверный номер карты или пароль' },
                { status: 401 }
            );
        }

        // Проверяем, есть ли хеш пароля
        if (!user.password || user.password.trim() === '') {
            return NextResponse.json(
                { error: 'Пароль не установлен. Обратитесь к администратору' },
                { status: 401 }
            );
        }

        // Сравниваем пароль с хешем
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Неверный номер карты или пароль' },
                { status: 401 }
            );
        }

        // Создаём JWT токен
        const token = jwt.sign(
            {
                userId: user.id,
                card_id: user.card_id,
                email: user.email
            },
            process.env.JWT_SECRET!, // секрет хранится в .env
            { expiresIn: '7d' }      // срок жизни токена
        );

        // Убираем пароль из объекта пользователя
        const { password: _, ...userWithoutPassword } = user;

        // Создаём ответ с cookie
        const response = NextResponse.json({
            success: true,
            user: userWithoutPassword
        });

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 дней
            path: '/'
        });

        return response;

    } catch (error: any) {
        console.error('Ошибка сервера:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
