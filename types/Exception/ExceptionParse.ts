import {Timestamp} from "next/dist/server/lib/cache-handlers/types";

export interface JsonError {
    id: number;
    employee_title: string;
    first_column: string;
    second_column: string;
    issue_description: string;
    recovery_title: string;
    device_type: string;
    issue_type: string;
    solving_time: number;
}

export interface ILocalIssue {
    employee: string;
    first_column: string;
    second_column: string;
    error_robot: string;
    error_start_time: Date;
    error_end_time: Date;
    recovery_title: string;
    solving_time: number;
    device_type: string;
    issue_type: string;
    issue_description: string;
    warehouse?: string;
    add_by?: string;
    uniq_key?: string;
    shift_type?: string;
}

export interface ParsedResult {
    issues: ILocalIssue[];
    errors: string[];
}

export interface IIssueTemplate {
    id: number;
    employee_title: string;
    created_at: Timestamp;
    issue_sub_type: string;
    issue_description: string;
    recovery_title: string;
    issue_type: string;
    solving_time: number;
    created_by: number;
    updated_at: Timestamp | null;
    updated_by: number | null;
    equipment_type: string;
}
