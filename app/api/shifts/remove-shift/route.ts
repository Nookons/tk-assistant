import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import jwt from 'jsonwebtoken';

// Проверка токена
export function authenticate(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
        return null;
    }
}

export async function DELETE(req: NextRequest) {
    const user = authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { shift_id } = await req.json();

    if (!shift_id) {
        return NextResponse.json({ error: 'shift_id is required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('shifts_list')
        .delete()
        .eq('id', shift_id);

    if (error) {
        console.error('Supabase delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Shift deleted successfully' }, { status: 200 });
}