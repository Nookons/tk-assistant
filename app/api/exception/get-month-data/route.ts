import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month"); // YYYY-MM

        if (!month) {
            return NextResponse.json(
                { error: "Month parameter is required (YYYY-MM)" },
                { status: 400 }
            );
        }

        if (!/^\d{4}-\d{2}$/.test(month)) {
            return NextResponse.json(
                { error: "Invalid month format. Use YYYY-MM" },
                { status: 400 }
            );
        }

        const [year, monthNum] = month.split('-').map(Number);
        const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
        const nextYear = monthNum === 12 ? year + 1 : year;

        const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01T00:00:00Z`;
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00Z`;

        console.log('Fetching exceptions:', { startDate, endDate });

        // Получаем ВСЕ данные порциями
        let allData: any[] = [];
        let from = 0;
        const pageSize = 1000;
        let totalFetched = 0;

        while (true) {
            const { data, error, count } = await supabase
                .from("exceptions_glpc")
                .select("*", { count: 'exact' })
                .gte("error_start_time", startDate)
                .lt("error_start_time", endDate)
                .order('error_start_time', { ascending: false })
                .range(from, from + pageSize - 1);

            if (error) {
                console.error("Supabase error:", error);
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }

            if (!data || data.length === 0) {
                break;
            }

            allData = allData.concat(data);
            totalFetched += data.length;

            console.log(`Fetched ${totalFetched}/${count} records`);

            // Если получили меньше чем pageSize, значит это последняя страница
            if (data.length < pageSize) {
                break;
            }

            from += pageSize;
        }

        console.log(`Total returned: ${allData.length} records`);

        return NextResponse.json(allData, { status: 200 });
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 }
        );
    }
}