import {IUser} from "@/types/user/user";
import {IRobot} from "@/types/robot/robot";

export interface IHistoryStockItem {
    id: number;
    created_at: string;
    card_id: number;
    material_number: string;
    quantity: number;
    warehouse: string;
    location: string | null;
    robot_id: number | null;
    robot_data?: IRobot | null;
    user: IUser;
}