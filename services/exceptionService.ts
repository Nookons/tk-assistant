import {supabase} from "@/lib/supabaseClient";
import dayjs from "dayjs";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import utc from "dayjs/plugin/utc";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {IIssueTemplate} from "@/types/Exception/ExceptionParse";

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
}