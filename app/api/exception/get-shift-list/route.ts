import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { authenticate } from "@/app/api/shifts/get-all-shifts/route";
import { getWorkDate } from "@/futures/Date/getWorkDate";
import dayjs from "dayjs";

export async function GET(req: NextRequest) {
    const user = authenticate(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dateParam = req.nextUrl.searchParams.get("date");
    const shift   = req.nextUrl.searchParams.get("shift");

    if (!dateParam) return NextResponse.json({ error: "Date is required" }, { status: 400 });
    if (!shift)     return NextResponse.json({ error: "Shift is required" }, { status: 400 });

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) return NextResponse.json({ error: "Invalid date format" }, { status: 400 });

    // продолжаем код после получения workDate
    const workDay = dayjs(date);          // исходный день, переданный пользователем
    let startShift: dayjs.Dayjs;
    let endShift: dayjs.Dayjs;

    if (shift === 'night') {
        // 18:00 предыдущего дня … 06:00 текущего (см. getWorkDate)
        const base = dayjs(getWorkDate(date)).hour(18).minute(0).second(0);
        startShift = base;
        endShift   = base.add(12, 'hour');
    } else if (shift === 'day') {
        // 06:00 … 18:00 текущего дня
        startShift = workDay.hour(6).minute(0).second(0);
        endShift   = workDay.hour(18).minute(0).second(0);
    } else {
        return NextResponse.json({ error: 'Unknown shift type' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('exceptions_glpc')
        .select('*')
        .eq('shift_type', shift)
        .gte('error_start_time', startShift.toISOString())
        .lt('error_start_time', endShift.toISOString());

    if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data || data.length === 0) {
        return NextResponse.json({ message: "No shifts found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
}