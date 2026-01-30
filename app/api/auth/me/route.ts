import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';


export function authenticate(req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
        return null;
    }
}


export async function GET(req: NextRequest) {
    const decoded = authenticate(req);

    if (!decoded) {
        return NextResponse.json({ error: 'Not cookie token saved' }, { status: 401 });
    }


    const { card_id } = decoded as { card_id: number };

    const { data: user, error } = await supabase
        .from('employees')
        .select('*')
        .eq('card_id', card_id)
        .maybeSingle();

    if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }


    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
}
