import {supabase} from "@/lib/supabase/client";
import dayjs from "dayjs";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import utc from "dayjs/plugin/utc";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";

dayjs.extend(utc);

export class ReportService {

    static async getDayData(date: Date, shift_type: "day" | "night") {
        const pad = (n: number) => String(n).padStart(2, '0');

        // Форматируем дату как YYYY-MM-DD в локальном времени
        const localDateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

        let start: string;
        let end: string;

        if (shift_type === "day") {
            start = `${localDateStr}T06:00:00`;
            end   = `${localDateStr}T18:00:00`;
        } else {
            // Ночная смена: следующий день для end
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            const nextDateStr = `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}`;

            start = `${localDateStr}T18:00:00`;
            end   = `${nextDateStr}T06:00:00`;
        }

        console.log("START:", start);
        console.log("END:", end);

        const { data: exceptions } = await supabase
            .from('exceptions_glpc')
            .select('*, user:employees!add_by(user_name, card_id, email, phone, warehouse, position, avatar_url)')
            .gte('error_start_time', start)
            .lt('error_start_time', end)
            .eq('shift_type', shift_type);

        const { data: changed_parts } = await supabase
            .from('changed_parts')
            .select('*, user:employees!card_id(user_name, card_id, email, phone, warehouse, position, avatar_url), robot:robots_maintenance_list!id(*)')
            .gte('created_at', start)
            .lt('created_at', end);

        const { data: changed_status } = await supabase
            .from('change_status_robots')
            .select('*, user:employees!add_by(user_name, card_id, email, phone, warehouse, position, avatar_url)')
            .gte('created_at', start)
            .lt('created_at', end);

        const data = [
            exceptions,
            changed_parts,
            changed_status
        ];

        return data;
    }

}