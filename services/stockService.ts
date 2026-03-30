import {supabase} from "@/lib/supabase/client";
import dayjs from "dayjs";
import {IStockItemTemplate, IStockLocationSlot} from "@/types/stock/StockItem";
import utc from "dayjs/plugin/utc";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {IStockAmountItem} from "@/types/stock/StockAmounts";
import {LocationItem} from "@/types/stock/SummaryItem";
import {useUserStore} from "@/store/user";
import {IUser} from "@/types/user/user";

dayjs.extend(utc);

export class StockService {

    static async getStockHistory(warehouse: string): Promise<IHistoryStockItem[] | null> {
        const threeMonthsAgo = dayjs().subtract(3, 'month').startOf('month').toISOString();

        const { data, error } = await supabase
            .from('stock_history')
            .select()
            .gte('created_at', threeMonthsAgo)
            .eq('warehouse', warehouse);

        if (error) throw new Error(`${error.message}`);
        return data;
    }

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

    static async moveItem(item: LocationItem, newLocation: string, user: IUser, quantity?: number): Promise<LocationItem> {
        const moveQty = quantity ?? item.total_quantity;
        const remainingQty = item.total_quantity - moveQty;
        const newLocationKey = `${item.warehouse.toLowerCase()}-${newLocation.toLowerCase()}`;

        const { data: existing } = await supabase
            .from('stock')
            .select('*')
            .eq('location_key', newLocationKey)
            .eq('material_number', item.material_number)
            .maybeSingle();

        let resultData: LocationItem;

        if (existing) {
            const { data: updated, error } = await supabase
                .from('stock')
                .update({
                    quantity: existing.quantity + moveQty,
                    updated_at: dayjs().toISOString(),
                    last_update_by: user.card_id,
                })
                .eq('location_key', newLocationKey)
                .eq('material_number', item.material_number)
                .select('*')
                .single();

            if (error || !updated) throw new Error(`Failed to update target location: ${error?.message}`);
            resultData = updated;
        } else {
            const { data: inserted, error } = await supabase
                .from('stock')
                .insert({
                    updated_at: dayjs().toISOString(),
                    quantity: moveQty,
                    material_number: item.material_number,
                    last_update_by: user.card_id,
                    warehouse: item.warehouse,
                    location: newLocation,
                    location_key: newLocationKey,
                })
                .select('*')
                .single();

            if (error || !inserted) throw new Error(`Failed to insert into new location: ${error?.message}`);
            resultData = inserted;
        }

        if (remainingQty <= 0) {
            await supabase
                .from('stock')
                .delete()
                .eq('location_key', item.location_key)
                .eq('material_number', item.material_number);
        } else {
            await supabase
                .from('stock')
                .update({ quantity: remainingQty, updated_at: dayjs().toISOString() })
                .eq('location_key', item.location_key)
                .eq('material_number', item.material_number);
        }

        return resultData;
    }

    static async moveLocation(items: LocationItem[], newLocation: string, user: IUser): Promise<LocationItem[]> {
        const results: LocationItem[] = [];

        for (const item of items) {
            const moved = await StockService.moveItem(item, newLocation, user);
            results.push(moved);
        }

        return results;
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