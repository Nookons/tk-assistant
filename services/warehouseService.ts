import {IUser} from "@/types/user/user";
import {IWarehouse} from "@/types/Warehouse/Warehouse";
import {supabase} from "@/lib/supabase/client";


export class WarehouseService {

    static async getWarehousesList(): Promise<IWarehouse[]> {
        const {data, error} = await supabase
            .from('warehouses')
            .select(`*`)

        if (error) throw error;

        return data as IWarehouse[];
    }
}