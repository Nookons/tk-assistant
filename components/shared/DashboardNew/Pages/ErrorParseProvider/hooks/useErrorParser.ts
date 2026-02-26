import { useCallback, useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";

import { ILocalIssue, JsonError } from "@/types/Exception/ExceptionParse";
import { IUser } from "@/types/user/user";
import { IRobot } from "@/types/robot/robot";

import { getExceptionsTemplates } from "@/futures/exception/getExceptionsTemplates";
import { getEmployeesList } from "@/futures/user/getEmployees";
import { validateErrorLine, validateErrorLineP3 } from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/ValidateErrorLine";
import { parseErrorTime } from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/ParseErrorTime";

import errors_data_raw from "@/utils/ErrorsPatterns/ErrorsPatterns.json";
import { useRobotsByWarehouse } from "./useRobotsByWarehouse";
import {getUserWarehouse} from "@/utils/getUserWarehouse";

const errors_data = errors_data_raw as JsonError[];


const buildGlpcIssue = (
    parts: string[],
    currentEmployee: string,
    robots: IRobot[],
    now: dayjs.Dayjs
): ILocalIssue | null => {
    const [errorString, errorRobot, errorTime] = parts;
    if (errorString === "Translate") return null;

    const pattern = errors_data.find((e) =>
        e.employee_title.toLowerCase().includes(errorString.toLowerCase())
    );
    if (!pattern) return null;

    const startTime = parseErrorTime(errorTime, now);
    const robotState = robots.find((r) => Number(r.robot_number) === Number(errorRobot));

    return {
        employee:          currentEmployee,
        first_column:      pattern.first_column,
        second_column:     pattern.second_column,
        error_robot:       errorRobot,
        error_start_time:  startTime.toDate(),
        error_end_time:    startTime.add(pattern.solving_time, "minute").toDate(),
        recovery_title:    pattern.recovery_title,
        solving_time:      pattern.solving_time,
        device_type:       robotState?.robot_type ?? "Unknown",
        issue_type:        pattern.issue_type,
        issue_description: pattern.issue_description,
        warehouse:         "GLPC",
    };
};

const buildP3Issue = (parts: string[], currentEmployee: string, p3Robots: IRobot[], templates: NonNullable<Awaited<ReturnType<typeof getExceptionsTemplates>>>, now: dayjs.Dayjs): ILocalIssue | null => {
    const robot_number  = parts[0];
    const issue_type    = parts[1];
    const issue_sub_type = parts[2];
    const start_time    = parts[parts.length - 1]; // всегда последний
    const recovery_title = parts.slice(3, parts.length - 1).join(', '); // всё между

    console.log(start_time);

    const pattern = templates.find(item => {
        const title = item.employee_title?.toLowerCase() ?? '';
        const subType = issue_sub_type?.toLowerCase() ?? '';

        return title.includes(subType) || subType.includes(title);
    });

    if (!pattern) return null;

    let device_type = '';

    const hasTime = /^\d{1,2}:\d{2}$/.test(start_time.trim());
    const startTime = parseErrorTime(hasTime ? start_time : '', now);

    if (robot_number.startsWith('H')) {
        device_type = 'Workstation'
    } else {
        device_type = p3Robots.find((r) => Number(r.robot_number) === Number(robot_number))?.robot_type ?? "Unknown";
    }

    return {
        employee:          currentEmployee,
        first_column:      pattern.issue_type,
        second_column:     pattern.issue_sub_type,
        error_robot:       robot_number,
        error_start_time:  startTime.toDate(),
        error_end_time:    startTime.add(pattern.solving_time, "minute").toDate(),
        recovery_title:    recovery_title,
        solving_time:      pattern.solving_time,
        device_type:       device_type,
        issue_type:        pattern.equipment_type,
        issue_description: issue_sub_type,
        warehouse:         "P3",
    };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useErrorParser = () => {
    const [inputValue, setInputValue]     = useState("");
    const [parsedIssues, setParsedIssues] = useState<ILocalIssue[]>([]);
    const [parseErrors, setParseErrors]   = useState<string[]>([]);

    const { p3, all: robots } = useRobotsByWarehouse();

    const { data: templates_data } = useQuery({
        queryKey: ["exception-templates"],
        queryFn:  getExceptionsTemplates,
        retry:    false,
    });

    const parse = useCallback(async () => {
        setParseErrors([]);
        setParsedIssues([]);

        const lines = inputValue
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);


        if (!templates_data) {
            toast.error("Templates not loaded. Try again.");
            return;
        }

        const users: IUser[] | null = await getEmployeesList();

        if (!users) {
            toast.error("Failed to fetch employees list");
            return;
        }

        const now= dayjs();

        let currentEmployee   = "";
        let user_warehouse: string = '';

        const tempParsed: ILocalIssue[] = [];
        const tempErrors: string[]      = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const current_user = users.find((u) => u.user_name.toLowerCase() === line.toLowerCase());

            if (current_user) {
                console.log(current_user);
                currentEmployee = line;
                user_warehouse = getUserWarehouse(current_user.warehouse);
                return;
            }

            console.log(currentEmployee);
            console.log(user_warehouse);
            console.log(line);

            //console.log([...line].map(c => c + ' = ' + c.charCodeAt(0)));
            const parts = line.trim().split(/[.,]/).map(s => s.trim());

            if (user_warehouse === 'P3') {
                if (parts.length < 5) {
                    if (parts.length < 2) return;
                    tempErrors.push(`Line ${lineNum}: Error have not correct pattern, plase use only . and must be 5 parts -> ${line}`);
                    return;
                }

                const issue = buildP3Issue(parts, currentEmployee, p3, templates_data, now);

                if (!issue) {
                    tempErrors.push(`Line ${lineNum}: Unknown error type "${parts[2]}" (P3)`);
                    return;
                }

                tempParsed.push(issue);
                return;

            } else {
                const issue = buildGlpcIssue(parts, currentEmployee, robots, now);

                if (!issue) {
                    tempErrors.push(`Line ${lineNum}: Unknown error type "${parts[0]}" - ${line}`);
                    return;
                }

                tempParsed.push(issue);
                return;
            }
        });

        setParsedIssues(tempParsed);
        setParseErrors(tempErrors);

        if (tempParsed.length)  toast.success(`Parsed ${tempParsed.length} issue${tempParsed.length > 1 ? "s" : ""}`);
        if (tempErrors.length)  toast.warning(`${tempErrors.length} error${tempErrors.length > 1 ? "s" : ""} during parsing`);

    }, [inputValue, robots, p3, templates_data]);

    const clear = useCallback(() => {
        setInputValue("");
        setParsedIssues([]);
        setParseErrors([]);
    }, []);

    return {
        inputValue,
        setInputValue,
        parsedIssues,
        parseErrors,
        parse,
        clear,
    };
};