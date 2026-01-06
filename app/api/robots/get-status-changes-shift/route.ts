import {supabase} from "@/lib/supabaseClient";
import {NextRequest, NextResponse} from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {authenticate} from "@/app/api/auth/me/route";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(req: NextRequest) {
    const user = authenticate(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dateParam = req.nextUrl.searchParams.get("date");
    const shift = req.nextUrl.searchParams.get("shift");

    if (!dateParam || !shift) {
        return NextResponse.json(
            { error: "Missing required parameters: date and shift" },
            { status: 400 }
        );
    }

    console.log('API received dateParam:', dateParam);
    console.log('API received shift:', shift);

    // Parse the date - ожидаем формат YYYY-MM-DD
    const date = dayjs(dateParam).tz("Europe/Warsaw");

    let startShift: dayjs.Dayjs;
    let endShift: dayjs.Dayjs;

    console.log('Parsed date:', date.format());
    console.log('Shift:', shift);

    if (shift === "night") {
        // Night shift: today 18:00 till tomorrow 06:00
        startShift = date.hour(18).minute(0).second(0).millisecond(0);
        endShift = date.add(1, 'day').hour(6).minute(0).second(0).millisecond(0);
    } else {
        // Day shift: today 06:00 till today 18:00
        startShift = date.hour(6).minute(0).second(0).millisecond(0);
        endShift = date.hour(18).minute(0).second(0).millisecond(0);
    }

    console.log('Start shift:', startShift.toISOString());
    console.log('End shift:', endShift.toISOString());

    const { data, error } = await supabase
        .from('change_status_robots')
        .select(`
            *, 
            user:employees!add_by(user_name, card_id, email, phone, warehouse, position),
            robot:robots_maintenance_list!robot_id(*)
        `)
        .gte('created_at', startShift.toISOString())
        .lt('created_at', endShift.toISOString());

    console.log('Supabase query result:', data?.length || 0, 'records');

    if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
}