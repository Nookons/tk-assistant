import {supabase} from "@/lib/supabase/client";
import dayjs from "dayjs";
import {IStockItemTemplate, IStockLocationSlot} from "@/types/stock/StockItem";
import utc from "dayjs/plugin/utc";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {LocationItem, LocationStock} from "@/types/stock/SummaryItem";
import {IUser} from "@/types/user/user";
import {IUserSession} from "@/types/Session/Session";

dayjs.extend(utc);

export class StockService {

    static async getStockSlots(): Promise<IStockLocationSlot[]> {
        const { data, error } = await supabase
            .from('stock')
            .select('*')

        if (error) throw error;
        return data ?? [];
    }

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

    static async addStockRecord(data: Partial<IHistoryStockItem>): Promise<IStockLocationSlot> {
        const params = {
            p_location: data.location,
            p_material_number: data.material_number,
            p_warehouse: data.warehouse?.toUpperCase(),
            p_quantity: data.quantity,
            p_card_id: Number(data.card_id),
            p_location_key: `${data.warehouse?.toLowerCase()}-${data.location?.toLowerCase()}`,
        };

        console.log('>>> addStockRecord params:', params);

        const { data: result, error } = await supabase
            .rpc('upsert_stock', params)
            .single();

        console.log('>>> addStockRecord result:', result, 'error:', error);

        if (error) throw error;
        return result as IStockLocationSlot;
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

    static async moveSlot(new_data: Partial<IHistoryStockItem>, old_data: IStockLocationSlot, card_id: number): Promise<{ added: IStockLocationSlot; subtracted: IStockLocationSlot | null }> {
        const moveQty = new_data.quantity;

        if (!moveQty || moveQty <= 0) throw new Error("Quantity must be greater than 0");
        if (moveQty > old_data.quantity) throw new Error(`Cannot move more than available (${old_data.quantity})`);
        if (!new_data.location) throw new Error("Target location is required");

        const added = await StockService.addStockRecord({ ...new_data, card_id });
        const subtracted = await StockService.subtractFromStock(old_data, moveQty);

        return { added, subtracted };
    }


    static async moveLocation(data: LocationStock, session: IUserSession, new_location: string): Promise<LocationItem[]> {
        const updatedItems = await Promise.all(
            data.items.map(async (item) => {

                const stock_location_slot = {
                    card_id: session.user.card_id,
                    material_number: item.material_number,
                    quantity: item.total_quantity,
                    warehouse: item.warehouse,
                    location: new_location,
                };

                await StockService.addStockRecord(stock_location_slot);
                await StockService.removeFromStock(item);

                return {
                    ...item,
                    location: new_location
                };
            })
        );

        return updatedItems;
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