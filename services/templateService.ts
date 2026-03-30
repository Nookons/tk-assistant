import {IStockItemTemplate, IStockLocationSlot} from "@/types/stock/StockItem";
import {supabase} from "@/lib/supabase/client";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";


export class TemplateService {

    static async getTemplateDetails(material_number: string): Promise<IStockItemTemplate> {
        const {data, error} = await supabase
            .from('stock_items_template')
            .select('*, user:add_by(*)')
            .eq('material_number', material_number)
            .maybeSingle()

        if (!data) throw error;
        return data
    }
    static async getTemplateHistory(material_number: string): Promise<IHistoryStockItem[]> {
        const {data, error} = await supabase
            .from('stock_history')
            .select('*, user:card_id(*), robot_data:robot_id(*)')
            .eq('material_number', material_number)

        if (!data) throw error;
        return data
    }
    static async getTemplateStockSlots(material_number: string): Promise<IStockLocationSlot[]> {
        const {data, error} = await supabase
            .from('stock')
            .select('*')
            .eq('material_number', material_number)

        if (!data) throw error;
        return data
    }
}