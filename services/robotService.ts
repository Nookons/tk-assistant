import {supabase} from "@/lib/supabaseClient";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {useUserStore} from "@/store/user";
import {IHistoryParts, IRobot} from "@/types/robot/robot";

export class robotService {

    static async addNewPart({part, quantity, robot,}: {
        part: IStockItemTemplate;
        quantity: number;
        robot: IRobot;
    }): Promise<IHistoryParts | null> {

        const user = useUserStore.getState().currentUser;

        // ⚠️ parts_numbers: [part.material_number] — ты вставляешь массив из одного элемента
        // если колонка в БД это array — окей
        // если колонка ожидает просто число/строку — убери []
        const { data, error } = await supabase
            .from('changed_parts')
            .insert({
                robot_id:      robot.id,
                parts_numbers: [part.material_number],  // ← array или одно значение?
                card_id:       user?.card_id ?? 0,       // ?? лучше чем || для чисел (|| считает 0 falsy)
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
}