import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params; // ← await обязателен в Next.js 15
    const body = await request.json();
    const { id: _id, created_at, ...updateFields } = body;

    const { data, error } = await supabase
        .from('issue_templates')
        .update({
            ...updateFields,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template: data, message: 'ok' }, { status: 200 });
}