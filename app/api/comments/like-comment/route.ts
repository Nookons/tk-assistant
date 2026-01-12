import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { comment_id, card_id } = body;

        if (!comment_id || !card_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if already liked - use maybeSingle() instead of single()
        const { data: existingLike, error: checkError } = await supabase
            .from('comment_likes')
            .select('id')
            .eq('comment_id', comment_id)
            .eq('card_id', card_id)
            .maybeSingle(); // FIXED: won't throw error if not found

        if (checkError) {
            console.error('Check error:', checkError);
            throw checkError;
        }

        let liked = false;

        if (existingLike) {
            // Unlike - record exists
            const { error: deleteError } = await supabase
                .from('comment_likes')
                .delete()
                .eq('comment_id', comment_id)
                .eq('card_id', card_id);

            if (deleteError) {
                console.error('Delete error:', deleteError);
                throw deleteError;
            }
            liked = false;
        } else {
            // Like - no record found
            const { error: insertError } = await supabase
                .from('comment_likes')
                .insert({
                    comment_id,
                    card_id
                });

            if (insertError) {
                console.error('Insert error:', insertError);
                throw insertError;
            }
            liked = true;
        }

        // Get updated like count
        const { count, error: countError } = await supabase
            .from('comment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment_id);

        if (countError) {
            console.error('Count error:', countError);
            throw countError;
        }

        return NextResponse.json({
            success: true,
            liked,
            likes: count || 0
        });
    } catch (error) {
        console.error('Error liking comment:', error);
        return NextResponse.json(
            { error: 'Failed to like comment', details: error },
            { status: 500 }
        );
    }
}