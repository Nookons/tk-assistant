import dayjs from "dayjs";
import {ILocalIssue} from "@/types/Exception/ExceptionParse";

export const generateIssueKey = (issue: ILocalIssue): string => {
    return `${issue.employee}.${issue.error_robot}.${dayjs(issue.error_start_time).format('YYYYMMDDHHmm')}`;
};