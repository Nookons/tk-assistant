import {supabase} from "@/lib/supabaseClient";
import dayjs from "dayjs";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import utc from "dayjs/plugin/utc";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";

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

}