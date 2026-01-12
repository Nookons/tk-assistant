import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { comment_id, comment, user_id } = body;

        if (!comment_id || !comment?.trim() || !user_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify ownership
        const { data: existingComment, error: fetchError } = await supabase
            .from('robots_comments')
            .select('add_by')
            .eq('id', comment_id)
            .single();

        if (fetchError || !existingComment) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        if (existingComment.add_by !== user_id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { data, error } = await supabase
            .from('robots_comments')
            .update({ body: comment.trim() })
            .eq('id', comment_id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            comment: data
        });
    } catch (error) {
        console.error('Error editing comment:', error);
        return NextResponse.json(
            { error: 'Failed to edit comment' },
            { status: 500 }
        );
    }
}