import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import jwt from 'jsonwebtoken';

// Функция для проверки токена
export function authenticate(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
        return null;
    }
}

// GET роут для получения смен
export async function GET(req: NextRequest) {
    // Проверяем токен
    const user = authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Получаем card_id из query
    const card_id = req.nextUrl.searchParams.get('card_id');
    if (!card_id) {
        return NextResponse.json({ error: 'card_id is required' }, { status: 400 });
    }

    // Запрос к Supabase
    const { data, error } = await supabase
        .from('shifts_list')
        .select('*')
        .eq('card_id', card_id);

    if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
        return NextResponse.json({ message: 'No shifts found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
}
