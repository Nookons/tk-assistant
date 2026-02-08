import {supabase} from "@/lib/supabaseClient";
import {NextRequest, NextResponse} from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(req: NextRequest) {
    const dateParam = req.nextUrl.searchParams.get("date");
    const shift = req.nextUrl.searchParams.get("shift");

    if (!dateParam || !shift) {
        return NextResponse.json(
            { error: "Missing required parameters: date and shift" },
            { status: 400 }
        );
    }

    const date = dayjs(dateParam).tz("Europe/Warsaw");

    let startShift: dayjs.Dayjs;
    let endShift: dayjs.Dayjs;


    if (shift === "night") {
        startShift = date.hour(18).minute(0).second(0).millisecond(0);
        endShift = date.add(1, 'day').hour(6).minute(0).second(0).millisecond(0);
    } else {
        startShift = date.hour(6).minute(0).second(0).millisecond(0);
        endShift = date.hour(18).minute(0).second(0).millisecond(0);
    }

    const { data, error } = await supabase
        .from('exceptions_glpc')
        .select('*')
        .gte('error_start_time', startShift.toISOString())
        .lt('error_start_time', endShift.toISOString());


    if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
}