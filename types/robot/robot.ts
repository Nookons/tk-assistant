import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {IUser} from "@/types/user/user";

export interface IRobotNotFull {
    id: number;
    created_at: Timestamp;
    updated_at: Timestamp;
    inspection_date: Timestamp | null;
    add_by: number;
    robot_number: string;
    robot_type: string;
    type_problem: string;
    problem_note: string;
    status: string;
    updated_by?: number;
}

export interface IRobot {
    id: number;
    created_at: Timestamp;
    updated_at: Timestamp;
    inspection_date: Timestamp | null;
    add_by: number;
    robot_number: string;
    robot_type: string;
    type_problem: string;
    problem_note: string;
    status: string;
    warehouse: string;
    updated_by?: IUser;

    status_history: IHistoryStatus[];
    parts_history: IHistoryParts[];
}

export interface IHistoryStatus {
    id: number;
    add_by: number;
    robot_id: number;
    created_at: Timestamp;
    new_status: string;
    old_status: string;
    robot_number: number;
    type_problem: string | null;
    problem_note: string | null;
    user: IUser;
}
export interface IHistoryParts {
    id: number;
    card_id: number;
    robot_id: number;
    created_at: Timestamp;
    parts_numbers: string;
    warehouse: string;
    quantity: number;
    user: IUser;
    robot: IRobotNotFull
}
