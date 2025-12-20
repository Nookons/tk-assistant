import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {IUser} from "@/types/user/user";
import {IRobot} from "@/types/robot/robot";


export interface IChangeRecord {
    id: number;
    created_at: Timestamp;
    robot_id: number;
    parts_numbers: string;
    card_id: number;
    user: IUser;
    robot: IRobot;
}