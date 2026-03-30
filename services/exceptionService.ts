import {supabase} from "@/lib/supabase/client";
import dayjs from "dayjs";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import utc from "dayjs/plugin/utc";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {IIssueTemplate} from "@/types/Exception/ExceptionParse";
import {IRobotException} from "@/types/Exception/Exception";

dayjs.extend(utc);

export class ExceptionService {

    static async removeException(id: number): Promise<number> {
        const { error } = await supabase
            .from('exceptions_glpc')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete exception error:', error);
            return 0;
        }

        return id;
    }

    static async createTemplate(data: Omit<IIssueTemplate, "id" | "created_at" | "updated_at" | "updated_by">): Promise<IIssueTemplate | null> {
        const { data: template, error } = await supabase
            .from('issue_templates')
            .insert(data)
            .select()
            .single(); // ← возвращает созданную запись

        if (error) {
            console.error('Create template error:', error);
            return null;
        }

        return template;
    }

    static async getExceptionsHistory(warehouse: string): Promise<{ currentMonth: number; prevMonth: number } | null> {
        const currentMonthStart = dayjs.utc().startOf('month').toISOString();
        const prevMonthStart = dayjs.utc().subtract(1, 'month').startOf('month').toISOString();
        const prevMonthEnd = dayjs.utc().subtract(1, 'month').endOf('month').toISOString();

        const [{ count: currentMonth }, { count: prevMonth }] = await Promise.all([
            supabase
                .from('exceptions_glpc')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', currentMonthStart)
                .eq('warehouse', warehouse),

            supabase
                .from('exceptions_glpc')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', prevMonthStart)
                .lte('created_at', prevMonthEnd)
                .eq('warehouse', warehouse),
        ]);

        return {
            currentMonth: currentMonth ?? 0,
            prevMonth: prevMonth ?? 0,
        };
    }

    static async getExceptionsChartHistory(warehouse: string): Promise<IRobotException[] | null> {
        const currentMonthStart = dayjs.utc().startOf('month').subtract(1, 'month').toISOString();

        const { data, error }= await supabase
                .from('exceptions_glpc')
                .select('*')
                .gte('created_at', currentMonthStart)
                .eq('warehouse', warehouse)
                .limit(5000)

        if (error) throw new Error(error.message);
        return data
    }
}