import {supabase} from "@/lib/supabaseClient";
import dayjs from "dayjs";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import utc from "dayjs/plugin/utc";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";

dayjs.extend(utc);

export class StockService {
    static async updateItemTemplate(data: Partial<IStockItemTemplate> & { id: number }): Promise<IStockItemTemplate> {

        const { data: updatedItem, error } = await supabase
            .from('stock_items_template')
            .update({
                ...data,
                updated_at: dayjs().utc().toISOString()
            })
            .eq('id', data.id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update item template: ${error.message}`);
        }

        return updatedItem;
    }

    static async removePartsFromStock(payload: {
        warehouse: string;
        location: string;
        material_number: string;
        quantity: number;
    }): Promise<unknown> {
        const locationKey = `${payload.warehouse.toLowerCase()}-${payload.location.toLowerCase()}`;

        const { data: result, error } = await supabase.rpc('remove_parts_from_stock', {
            p_location_key: locationKey,
            p_material_number: payload.material_number,
            p_quantity: payload.quantity,
        });

        if (error) throw new Error(error.message);
        return result;
    }

    static async removeHistoryItem(data: IHistoryStockItem): Promise<IHistoryStockItem> {
        const { data: result, error } = await supabase
            .rpc('remove_stock_history_item', { p_id: data.id });

        if (error) throw new Error(error.message);
        return result;
    }
}