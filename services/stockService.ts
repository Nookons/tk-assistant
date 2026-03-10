import {supabase} from "@/lib/supabaseClient";
import dayjs from "dayjs";
import {IStockItemTemplate, IStockLocationSlot} from "@/types/stock/StockItem";
import utc from "dayjs/plugin/utc";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {IStockAmountItem} from "@/types/stock/StockAmounts";
import {LocationItem} from "@/types/stock/SummaryItem";

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

    static async getStockItemLocations(data: IStockItemTemplate, warehouse: string): Promise<IStockLocationSlot[]> {
        const { data: updatedItem, error } = await supabase
            .from('stock')
            .select()
            .eq('material_number', data.material_number)
            .eq('warehouse', warehouse)
            .select()

        if (error) {
            throw new Error(`Failed to update item template: ${error.message}`);
        }

        return updatedItem;
    }

    static async subtractFromStock(data: IStockLocationSlot, quantity: number) {
        const { data: oldItem, error } = await supabase
            .from('stock')
            .select('*')
            .eq('location_key', data.location_key)
            .eq('material_number', data.material_number)
            .maybeSingle();

        if (error || !oldItem) return null;

        const newQuantity = oldItem.quantity - quantity;

        if (newQuantity <= 0) {
            const { error: deleteError } = await supabase
                .from('stock')
                .delete()
                .eq('location_key', data.location_key)
                .eq('material_number', data.material_number);

            return deleteError ? null : { ...oldItem, quantity: 0 };
        }

        const { data: updated, error: updateError } = await supabase
            .from('stock')
            .update({ quantity: newQuantity })
            .eq('location_key', data.location_key)
            .eq('material_number', data.material_number)
            .select()
            .single();

        return updateError ? null : updated;
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
        console.log(data);
        const {data: result, error} = await supabase
            .from('stock_history')
            .insert({
                card_id: data.card_id,
                material_number: data.material_number,
                warehouse: data.warehouse,
                quantity: data.quantity,
                location: data.location,
                robot_id: data.robot_id || null,
            })
            .select('*, user:employees!card_id(*), robot_data:robots_maintenance_list!id(*)')
            .single();

        if (error) throw new Error(error.message);

        return result;
    }

    static async removeFromStock(data: LocationItem): Promise<boolean> {
        const {data: result, error} = await supabase
            .from('stock')
            .delete()
            .eq('location_key', data.location_key)
            .eq('material_number', data.material_number)

        if (error) throw new Error(error.message);
        return true;
    }
}