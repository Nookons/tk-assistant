import {supabase} from "@/lib/supabase/client";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {useUserStore} from "@/store/user";
import {IHistoryParts, IHistoryStatus, IRobot} from "@/types/robot/robot";
import dayjs from "dayjs";

export class robotService {

    static async addNewPart({part, quantity, robot,}: { part: IStockItemTemplate; quantity: number; robot: IRobot; }): Promise<IHistoryParts | null> {
        const user = useUserStore.getState().currentUser;

        const { data, error } = await supabase
            .from('changed_parts')
            .insert({
                robot_id:      robot.id,
                parts_numbers: [part.material_number],
                card_id:       user?.card_id ?? 0,
                warehouse:     robot?.warehouse ?? '',
                quantity,
            })
            .select('*, user:employees!card_id(*), robot:robots_maintenance_list!robot_id(*)')
            .maybeSingle();

        if (error) {
            console.error('addNewPart error:', error);
            return null;
        }

        return data as IHistoryParts;
    }

    static async getStatusesHistory(warehouse: string): Promise<IHistoryStatus[] | null> {
        const threeMonthsAgo = dayjs().subtract(3, 'month').startOf('month').toISOString();

        const { data, error } = await supabase
            .from('change_status_robots')
            .select('*')
            .gte('created_at', threeMonthsAgo)
            .eq('warehouse', warehouse)

        if (error) throw new Error('Error getting statuses history');
        return data;
    }
}