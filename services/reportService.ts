import {supabase} from "@/lib/supabaseClient";
import dayjs from "dayjs";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import utc from "dayjs/plugin/utc";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";

dayjs.extend(utc);

export class ReportService {

    static async getDayData(date: Date, shift_type: "day" | "night"){
        let start: Date;
        let end: Date;

        if (shift_type === "day") {
            start = new Date(date);
            start.setHours(6, 0, 0, 0);

            end = new Date(date);
            end.setHours(18, 0, 0, 0);

        } else {
            start = new Date(date);
            start.setHours(18, 0, 0, 0);

            end = new Date(date);
            end.setDate(end.getDate() + 1);
            end.setHours(6, 0, 0, 0);
        }

        console.log("START LOCAL:", start);
        console.log("START ISO:", start.toISOString());

        console.log("END LOCAL:", end);
        console.log("END ISO:", end.toISOString());

        const { data: exceptions } = await supabase
            .from('exceptions_glpc')
            .select('*, user:employees!add_by(user_name, card_id, email, phone, warehouse, position, avatar_url)')
            .gte('error_start_time', start.toISOString())
            .lt('error_start_time', end.toISOString())
            .eq('shift_type', shift_type)

        const { data: changed_parts } = await supabase
            .from('changed_parts')
            .select('*, user:employees!card_id(user_name, card_id, email, phone, warehouse, position, avatar_url), robot:robots_maintenance_list!id(*)')
            .gte('created_at', start.toISOString())
            .lt('created_at', end.toISOString());

        const { data: changed_status } = await supabase
            .from('change_status_robots')
            .select('*, user:employees!add_by(user_name, card_id, email, phone, warehouse, position, avatar_url)')
            .gte('created_at', start.toISOString())
            .lt('created_at', end.toISOString());

        const data = [
            exceptions,
            changed_parts,
            changed_status
        ];

        return data;
    }

}