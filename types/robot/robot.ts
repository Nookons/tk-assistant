import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {spec} from "node:test/reporters";

export interface IRobot {
    id: number;
    created_at: Timestamp;
    updated_at: Timestamp;
    add_by: number;
    robot_number: string;
    robot_type: string;
    type_problem: string;
    problem_note: string;
    status: string;
    updated_by?: number;
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
}