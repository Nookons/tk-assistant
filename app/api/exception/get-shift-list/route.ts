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

    let startShift: dayjs.Dayjs;
    let endShift: dayjs.Dayjs;

    if (shift === 'night') {
        // Ночная смена: 18:00 выбранного дня → 06:00 следующего дня
        // getWorkDate уже учитывает, что если сейчас 05:45, то это продолжение смены предыдущего дня
        const workDate = getWorkDate(date);
        console.log('🔵 Work date for night shift:', {
            original: dayjs(date).format('YYYY-MM-DD'),
            workDate: dayjs(workDate).format('YYYY-MM-DD')
        });

        startShift = dayjs(workDate).hour(18).minute(0).second(0).millisecond(0);
        endShift = dayjs(workDate).add(1, 'day').hour(6).minute(0).second(0).millisecond(0);
    } else if (shift === 'day') {
        // Дневная смена: 06:00 → 18:00 выбранного дня
        startShift = dayjs(date).hour(6).minute(0).second(0).millisecond(0);
        endShift = dayjs(date).hour(18).minute(0).second(0).millisecond(0);
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
        shifts: allData ? [...new Set(allData.map(d => d.shift_type))] : [],
        timeRange: allData && allData.length > 0 ? {
            first: allData[0].error_start_time,
            last: allData[allData.length - 1].error_start_time
        } : 'No data'
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
        sampleRecord: data && data.length > 0 ? {
            id: data[0].id,
            employee: data[0].employee,
            error_start_time: data[0].error_start_time,
            shift_type: data[0].shift_type
        } : 'No data'
    });

    if (error) {
        console.error("❌ Supabase error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
        console.log('⚠️ No data found - returning empty array');
        return NextResponse.json([], { status: 200 });
    }

    console.log('✅ Returning data:', {
        count: data.length,
        employees: [...new Set(data.map(d => d.employee))]
    });

    return NextResponse.json(data, { status: 200 });
}