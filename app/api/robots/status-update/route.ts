import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {old_status, new_status, card_id, robot_number, robot_id, type_problem, problem_note} = body;

        // --- 1. Validation Check ---
        if (!new_status || !card_id || !robot_id) {
            return NextResponse.json(
                { error: 'Missing required fields (new_status, card_id, robot_id)' },
                { status: 400 }
            );
        }

        // --- 2. Log Status Change (History Table) ---
        const { data: log_data, error: log_error } = await supabase
            .from('change_status_robots')
            .insert({
                robot_number: robot_number,
                robot_id: robot_id,
                new_status: new_status,
                old_status: old_status,
                add_by: card_id,
                type_problem,
                problem_note
            })
            .select()
            .single();

        console.log('Supabase Log Insert Data:', log_data);

        // --- 3. Check for Log Insertion Error ---
        if (log_error) {
            console.error('Supabase Log Insert Error:', log_error);
            return NextResponse.json(
                { error: `Failed to log status change: ${log_error.message}` },
                { status: 500 }
            );
        }

        // --- 4. Update Current Robot Status (Primary Table) ---
        const { data: robot_data, error: robot_error } = await supabase
            .from('robots_maintenance_list')
            .update({
                status: new_status, // Assuming the column is named 'status' or 'new_status'
                updated_at: new Date().toISOString(), // Use ISO string for consistency
                updated_by: card_id, // Use ISO string for consistency
            })
            .eq('id', robot_id)
            .select()
            .single();

        console.log('Supabase Robot Update Data:', robot_data);

        // --- 5. Check for Robot Update Error ---
        if (robot_error) {
            console.error('Supabase Robot Update Error:', robot_error);
            return NextResponse.json(
                {
                    error: `Failed to update robot status: ${robot_error.message}`,
                    log_entry_successful: true // Optional context
                },
                { status: 500 }
            );
        }

        // --- 6. Success Response ---
        return NextResponse.json(robot_data, { status: 200 });

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown server error';
        console.error('Server error:', err);
        return NextResponse.json({ error: `Invalid JSON or server error: ${errorMessage}` }, { status: 500 });
    }
}