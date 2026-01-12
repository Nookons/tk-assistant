// File: /app/api/comments/get-comments/route.ts
// Alternative approach WITHOUT RPC function

import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const robot_id = searchParams.get('robot_id');
    const card_id = searchParams.get('card_id');

    if (!robot_id) {
        return NextResponse.json(
            { error: 'Robot ID is required' },
            { status: 400 }
        );
    }

    try {
        // Fetch comments with employee data
        const { data: commentsData, error: commentsError } = await supabase
            .from('robots_comments')
            .select(`
                id,
                created_at,
                updated_at,
                body,
                robot_record,
                add_by,
                parent_id,
                employees:add_by (
                    user_name,
                    card_id
                )
            `)
            .eq('robot_record', parseInt(robot_id))
            .order('created_at', { ascending: false });

        if (commentsError) {
            console.error('Comments fetch error:', commentsError);
            throw commentsError;
        }

        // Fetch all likes for these comments
        const commentIds = commentsData.map(c => c.id);

        const { data: likesData, error: likesError } = await supabase
            .from('comment_likes')
            .select('comment_id, card_id')
            .in('comment_id', commentIds);

        if (likesError) {
            console.error('Likes fetch error:', likesError);
            // Don't throw, just continue without likes
        }

        // Count likes per comment
        const likesCount = new Map<number, number>();
        const userLikes = new Set<number>();


        if (likesData) {
            console.log(likesData);

            likesData.forEach(like => {
                // Count total likes
                likesCount.set(
                    like.comment_id,
                    (likesCount.get(like.comment_id) || 0) + 1
                );

                console.log(card_id);
                console.log(like.card_id);

                if (!card_id) return
                console.log(parseInt(card_id));

                // Track user's likes
                if (card_id && like.card_id === parseInt(card_id)) {
                    userLikes.add(like.comment_id);
                }
            });
        }

        // Combine data
        const comments = commentsData.map(comment => ({
            id: comment.id,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            body: comment.body,
            robot_record: comment.robot_record,
            add_by: comment.add_by,
            parent_id: comment.parent_id,
            employees: Array.isArray(comment.employees)
                ? comment.employees[0]
                : comment.employees,
            likes: likesCount.get(comment.id) || 0,
            liked_by_user: userLikes.has(comment.id)
        }));

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch comments',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}