import {IUser} from "@/types/user/user";
import {IRobot} from "@/types/robot/robot";

export interface IChangeStatusRobot {
    id: number;
    created_at: string;
    add_by: number;
    old_status: string;
    new_status: string;
    robot_number: number;
    robot_id: number;
    type_problem: string;
    problem_note: string;
    user: IUser;
    robot: IRobot;
}
