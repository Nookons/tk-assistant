import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';

export async function GET(request: NextRequest) {
    try {
        const robot_id = request.nextUrl.searchParams.get('robot_id');

        const now = dayjs();
        const hour = now.hour();

        let shiftStart;
        let shiftEnd;

        // Логика определения текущей смены
        if (hour >= 6 && hour < 18) {
            // Дневная смена: сегодня 06:00 - сегодня 18:00
            shiftStart = now.set('hour', 6).startOf('hour');
            shiftEnd = now.set('hour', 18).startOf('hour');
        } else {
            // Ночная смена (два сценария):
            if (hour >= 18) {
                // Сейчас вечер (например, 20:00). Смена началась сегодня в 18:00, закончится завтра в 06:00
                shiftStart = now.set('hour', 18).startOf('hour');
                shiftEnd = now.add(1, 'day').set('hour', 6).startOf('hour');
            } else {
                // Сейчас раннее утро (например, 02:00). Смена началась вчера в 18:00, закончится сегодня в 06:00
                shiftStart = now.subtract(1, 'day').set('hour', 18).startOf('hour');
                shiftEnd = now.set('hour', 6).startOf('hour');
            }
        }

        let query = supabase
            .from('changed_parts')
            .select(`*`)
            .gte('created_at', shiftStart.toISOString())
            .lt('created_at', shiftEnd.toISOString()) // Используем lt (меньше), так как 18:00:00 — это уже начало следующей смены
            .order('created_at', { ascending: false });

        if (robot_id) {
            query = query.eq('robot_id', robot_id);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Возвращаем данные вместе с мета-информацией о смене (полезно для фронтенда)
        return NextResponse.json({
            shift: {
                start: shiftStart.format('YYYY-MM-DD HH:mm'),
                end: shiftEnd.format('YYYY-MM-DD HH:mm'),
                type: hour >= 6 && hour < 18 ? 'Day' : 'Night'
            },
            data
        }, { status: 200 });

    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}