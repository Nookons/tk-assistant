import dayjs from "dayjs";
import {ILocalIssue} from "@/types/Exception/ExceptionParse";

export type WarehouseType = 'GLPC' | 'P3';

export const formatForClipboard = (issues: ILocalIssue[], type: WarehouseType): string => {
    const rows = issues.map(error => {
        const diffMinutes = dayjs(error.error_end_time).diff(dayjs(error.error_start_time), 'minute');
        const date = dayjs().format('MM/DD/YYYY');
        const startTime = dayjs(error.error_start_time).format("HH:mm");
        const endTime = dayjs(error.error_end_time).format("HH:mm");

        if (type === 'GLPC') {
            return [
                date,
                "Inventory Warehouse",
                error.device_type,
                error.error_robot,
                error.issue_type,
                error.first_column,
                error.second_column,
                "",
                error.first_column,
                error.recovery_title,
                error.employee,
                startTime,
                endTime,
                diffMinutes,
                error.employee,
                "已处理Processed"
            ];
        } else {
            return [
                date,
                error.device_type,
                "",
                error.error_robot,
                error.issue_type,
                error.first_column,
                error.second_column,
                error.issue_description,
                error.recovery_title,
                "已处理Processed",
                `@${error.employee}`,
                startTime,
                endTime,
                `00:${diffMinutes}`,
            ];
        }
    });

    return rows.map(row => row.join('\t')).join('\n');
};