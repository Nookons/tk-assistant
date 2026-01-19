import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { data, error } = await supabase
            .from('exceptions_glpc')
            .select('*');

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        console.log('Supabase query result:', data?.length ?? 0, 'records');

        return NextResponse.json(data ?? [], { status: 200 });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json(
            { error: 'Unexpected server error' },
            { status: 500 }
        );
    }
}
