import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { authenticate } from "@/app/api/shifts/get-all-shifts/route";
import { getWorkDate } from "@/futures/Date/getWorkDate";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(req: NextRequest) {
    const user = authenticate(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dateParam = req.nextUrl.searchParams.get("date");
    const shift = req.nextUrl.searchParams.get("shift");

    console.log('🔵 API Request received:', { dateParam, shift });

    if (!dateParam) return NextResponse.json({ error: "Date is required" }, { status: 400 });
    if (!shift) return NextResponse.json({ error: "Shift is required" }, { status: 400 });

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) return NextResponse.json({ error: "Invalid date format" }, { status: 400 });

    console.log('🔵 Parsed date:', {
        original: dateParam,
        parsed: date.toISOString(),
        serverTimezone: process.env.TZ || 'not set',
        dayjsTimezone: dayjs.tz.guess()
    });

    const workDay = dayjs(date);
    let startShift: dayjs.Dayjs;
    let endShift: dayjs.Dayjs;

    if (shift === 'night') {
        // 18:00 предыдущего дня … 06:00 текущего
        const base = dayjs(getWorkDate(date)).hour(18).minute(0).second(0).millisecond(0);
        startShift = base;
        endShift = base.add(12, 'hour');
    } else if (shift === 'day') {
        // 06:00 … 18:00 текущего дня
        startShift = workDay.hour(6).minute(0).second(0).millisecond(0);
        endShift = workDay.hour(18).minute(0).second(0).millisecond(0);
    } else {
        return NextResponse.json({ error: 'Unknown shift type' }, { status: 400 });
    }

    console.log('🔵 Shift boundaries:', {
        shift,
        startShift: startShift.toISOString(),
        endShift: endShift.toISOString(),
        startShiftLocal: startShift.format('YYYY-MM-DD HH:mm:ss'),
        endShiftLocal: endShift.format('YYYY-MM-DD HH:mm:ss')
    });

    // Делаем запрос БЕЗ фильтра по shift_type для проверки
    const { data: allData, error: allError } = await supabase
        .from('exceptions_glpc')
        .select('*')
        .gte('error_start_time', startShift.toISOString())
        .lt('error_start_time', endShift.toISOString());

    console.log('🔵 Query without shift_type filter:', {
        totalRecords: allData?.length || 0,
        shifts: allData ? [...new Set(allData.map(d => d.shift_type))] : []
    });

    // Теперь с фильтром по shift_type
    const { data, error } = await supabase
        .from('exceptions_glpc')
        .select('*')
        .eq('shift_type', shift)
        .gte('error_start_time', startShift.toISOString())
        .lt('error_start_time', endShift.toISOString());

    console.log('🔵 Query WITH shift_type filter:', {
        totalRecords: data?.length || 0,
        sampleRecord: data && data.length > 0 ? data[0] : 'No data'
    });

    if (error) {
        console.error("❌ Supabase error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
        console.log('⚠️ No data found - returning empty array instead of 404');
        return NextResponse.json([], { status: 200 }); // Важно! Возвращаем пустой массив, а не 404
    }

    console.log('✅ Returning data:', {
        count: data.length,
        employees: [...new Set(data.map(d => d.employee))]
    });

    return NextResponse.json(data, { status: 200 });
}