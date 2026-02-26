import {supabase} from "@/lib/supabaseClient";
import dayjs from "dayjs";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import utc from "dayjs/plugin/utc";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {IStockAmountItem} from "@/types/stock/StockAmounts";

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

    static async addStockRecord(data: Partial<IHistoryStockItem>): Promise<IStockItemTemplate | null> {
        const { data: oldItem, error } = await supabase
            .from('stock')
            .select('*')
            .eq('location', data.location)
            .eq('material_number', data.material_number)
            .eq('warehouse', data.warehouse?.toUpperCase())
            .maybeSingle();

        if (oldItem) {
            const { data: updatedItem } = await supabase
                .from('stock')
                .update({
                    quantity: oldItem.quantity + (data.quantity ?? 0),
                    last_update_by: data.card_id,
                })
                .eq('id', oldItem.id)
                .select()
                .single();

            return updatedItem;
        }

        const { data: newStockRecord } = await supabase
            .from('stock')
            .insert({
                quantity: data.quantity,
                last_update_by: data.card_id,
                material_number: data.material_number,
                warehouse: data.warehouse,
                location: data.location,
                location_key: `${data.warehouse?.toLowerCase()}-${data.location?.toLowerCase()}`,
            })
            .select()
            .single();

        return newStockRecord;
    }

    static async addStockHistory(data: Partial<IHistoryStockItem>): Promise<IHistoryStockItem> {
        const {data: result, error} = await supabase
            .from('stock_history')
            .insert({
                card_id: data.card_id,
                material_number: data.material_number,
                warehouse: data.warehouse,
                quantity: data.quantity,
                location: data.location,
            })
            .select('*, user:employees!card_id(*)')
            .single();

        if (error) throw new Error(error.message);

        return result;
    }
}