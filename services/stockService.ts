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

    static async removeHistoryItem(data: IHistoryStockItem): Promise<IStockItemTemplate> {

        // First, get the current stock item
        const { data: stockItem, error: fetchError } = await supabase
            .from('stock')
            .select()
            .eq('material_number', data.material_number)
            .eq('warehouse', data.warehouse)
            .eq('location', data.location)
            .single();

        if (fetchError || !stockItem) {
            throw new Error(`Failed to fetch stock item: ${fetchError?.message || 'Item not found'}`);
        }

        // Update the stock quantity (revert the change)
        const { data: mainStock, error: stockError } = await supabase
            .from('stock')
            .update({ quantity: stockItem.quantity - data.value })  // ✅ Fixed: object syntax
            .eq('material_number', data.material_number)
            .eq('warehouse', data.warehouse)
            .eq('location', data.location)
            .select()
            .single();

        if (stockError) {
            throw new Error(`Failed to update stock: ${stockError.message}`);
        }

        // Delete the history item
        const { data: deletedItem, error: deleteError } = await supabase
            .from('stock_history')
            .delete()
            .eq('id', data.id)
            .select()
            .single();

        if (deleteError) {
            throw new Error(`Failed to delete history item: ${deleteError.message}`);
        }

        return deletedItem;
    }
}