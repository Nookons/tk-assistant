import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { card_id, robot_id, comment, parent_id } = body;

        if (!card_id || !robot_id || !comment?.trim()) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate parent comment exists if parent_id is provided
        if (parent_id) {
            const { data: parentComment, error: parentError } = await supabase
                .from('robots_comments')
                .select('id')
                .eq('id', parent_id)
                .eq('robot_record', robot_id)
                .single();

            if (parentError || !parentComment) {
                return NextResponse.json(
                    { error: 'Parent comment not found' },
                    { status: 404 }
                );
            }
        }

        const { data, error } = await supabase
            .from('robots_comments')
            .insert({
                body: comment.trim(),
                robot_record: robot_id,
                add_by: card_id,
                parent_id: parent_id || null
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            comment: data
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json(
            { error: 'Failed to add comment' },
            { status: 500 }
        );
    }
}