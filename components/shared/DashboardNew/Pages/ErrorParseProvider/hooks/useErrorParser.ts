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

const errors_data = errors_data_raw as JsonError[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const findBestTemplate = (query: string, templates: Awaited<ReturnType<typeof getExceptionsTemplates>>) =>
    templates
        ?.filter((t) => query.toLowerCase().includes(t.employee_title.toLowerCase()))
        .sort((a, b) => b.employee_title.length - a.employee_title.length)[0];

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

const buildP3Issue = (
    parts: string[],
    currentEmployee: string,
    p3Robots: IRobot[],
    templates: NonNullable<Awaited<ReturnType<typeof getExceptionsTemplates>>>,
    now: dayjs.Dayjs
): ILocalIssue | null => {
    const [robot_number, , error_sub_type, recovery_text, errorTime] = parts;

    const pattern = findBestTemplate(error_sub_type, templates);
    if (!pattern) return null;

    const startTime = parseErrorTime(errorTime, now);
    const robotType = p3Robots.find((r) => Number(r.robot_number) === Number(robot_number))?.robot_type ?? "Unknown";

    return {
        employee:          currentEmployee,
        first_column:      pattern.issue_type,
        second_column:     pattern.issue_sub_type,
        error_robot:       robot_number,
        error_start_time:  startTime.toDate(),
        error_end_time:    startTime.add(pattern.solving_time, "minute").toDate(),
        recovery_title:    recovery_text,
        solving_time:      pattern.solving_time,
        device_type:       robotType,
        issue_type:        pattern.equipment_type,
        issue_description: error_sub_type,
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

        if (!lines.length) {
            toast.error("No data to parse");
            return;
        }

        if (!templates_data) {
            toast.error("Templates not loaded. Try again.");
            return;
        }

        const users: IUser[] | null = await getEmployeesList();
        if (!users) {
            toast.error("Failed to fetch employees list");
            return;
        }

        const now             = dayjs();
        let currentEmployee   = "";
        const tempParsed: ILocalIssue[] = [];
        const tempErrors: string[]      = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // ── Employee name line
            const isUser = users.find((u) => u.user_name === line);
            if (isUser) {
                currentEmployee = line;
                return;
            }

            const parts = line.trim().split(".");

            // ── Try GLPC format first
            const glpcValidation = validateErrorLine(line);
            if (glpcValidation.valid) {
                if (!currentEmployee) {
                    tempErrors.push(`Line ${lineNum}: No employee specified - "${line}"`);
                    return;
                }

                const issue = buildGlpcIssue(parts, currentEmployee, robots, now);

                if (!issue) {
                    tempErrors.push(`Line ${lineNum}: Unknown error type "${parts[0]}" - ${line}`);
                    return;
                }

                tempParsed.push(issue);
                return;
            }

            // ── Try P3 format
            const p3Validation = validateErrorLineP3(line);
            if (!p3Validation.valid) {
                tempErrors.push(`Line ${lineNum}: ${glpcValidation.error} - "${line}"`);
                return;
            }

            const issue = buildP3Issue(parts, currentEmployee, p3, templates_data, now);
            if (!issue) {
                tempErrors.push(`Line ${lineNum}: Unknown error type "${parts[2]}" (P3)`);
                return;
            }

            tempParsed.push(issue);
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