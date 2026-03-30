import {supabase} from "@/lib/supabase/client";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const warehouse = searchParams.get('warehouse')

    let query = supabase
        .from('robots_maintenance_list')
        .select(`
            *,
            add_by:employees!add_by(*),
            updated_by:employees!updated_by(*),
            status_history:change_status_robots!robot_id(
                *,
                user:employees!add_by(*)
            ),
            parts_history:changed_parts!robot_id(
                *,
                user:employees!card_id(*),
                robot:robots_maintenance_list!id(*)
            )
        `)

    if (warehouse) {
        query = query.eq('warehouse', warehouse)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error in Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data?.length) {
        return NextResponse.json({ message: 'cant find any robots' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
}