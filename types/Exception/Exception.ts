import {IUser} from "@/types/user/user";

export interface IRobotException {
    id: number;
    created_at: string;
    error_robot: number;
    add_by: number;
    device_type: string;
    employee: string;
    error_start_time: string;
    error_end_time: string;
    solving_time: number;
    first_column: string;
    second_column: string;
    issue_type: string;
    issue_description: string;
    recovery_title: string;
    uniq_key: string;
    shift_type: 'day' | 'night' | string;
    user: IUser;
}
