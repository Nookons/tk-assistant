import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {spec} from "node:test/reporters";
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
    updated_by?: number;

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
    user: IUser;
}
export interface IHistoryParts {
    id: number;
    card_id: number;
    robot_id: number;
    created_at: Timestamp;
    parts_numbers: string;
    user: IUser;
    robot: IRobotNotFull
}

interface IJoinEmployee {
    email: string;
    phone: number;
    card_id: number;
    position: string;
    user_name: string;
    warehouse: string;
}

export interface IRobotApiResponse {
    id: number;
    created_at: Timestamp;
    updated_at: Timestamp;
    robot_number: number;
    robot_type: string;
    type_problem: string[];
    problem_note: string | null;
    status: string;
    updated_by: IJoinEmployee;
    add_by: IJoinEmployee;
    status_history: any[];
}