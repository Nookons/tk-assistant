'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Check, FileText, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import { toast } from "sonner";
import errors_data_raw from '../../utils/ErrorsPatterns/ErrorsPatterns.json';
import Image from "next/image";
import TemplateInfo from "@/components/shared/ErrorParse/TemplateInfo";
import { ButtonGroup } from "@/components/ui/button-group"
import { useRobotsStore } from "@/store/robotsStore";
import { getEmployeesList } from "@/futures/user/getEmployees";
import { IUser } from "@/types/user/user";
import { addNewException } from "@/futures/exception/addNewException";
import { getInitialShiftByTime } from "@/futures/Date/getInitialShift";

dayjs.extend(duration);
dayjs.extend(utc);

// ==================== TYPES ====================
interface JsonError {
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
    add_by?: string;
    uniq_key?: string;
    shift_type?: string;
}

interface ParsedResult {
    issues: ILocalIssue[];
    errors: string[];
}

type WarehouseType = 'GLPC' | 'P3';

// ==================== CONSTANTS ====================
const errors_data = errors_data_raw as JsonError[];
const REQUEST_DELAY = 150; // ms between requests

// ==================== UTILITY FUNCTIONS ====================

/**
 * Определяет корректную дату/время ошибки с учетом смены дня
 */
const parseErrorTime = (errorTime: string, currentTime: dayjs.Dayjs): dayjs.Dayjs => {
    const [errorHour, errorMinute] = errorTime.split(':').map(Number);
    const currentHour = currentTime.hour();

    // Если сейчас ночная смена (00:00-06:00) и ошибка была вечером (18:00-00:00)
    // значит ошибка была вчера
    if (currentHour >= 0 && currentHour < 6 && errorHour >= 18 && errorHour < 24) {
        return currentTime.subtract(1, 'day').hour(errorHour).minute(errorMinute).second(0);
    }

    return currentTime.hour(errorHour).minute(errorMinute).second(0);
};

/**
 * Валидация формата строки ошибки
 */
const validateErrorLine = (line: string): { valid: boolean; error?: string } => {
    const parts = line.split(".");

    if (parts.length < 3) {
        return { valid: false, error: "Invalid format (expected: Error.Robot.Time)" };
    }

    const [, , errorTime] = parts;

    if (!errorTime || !errorTime.includes(':')) {
        return { valid: false, error: "Invalid time format" };
    }

    const timeParts = errorTime.split(':');
    if (timeParts.length !== 2) {
        return { valid: false, error: "Time must be in HH:mm format" };
    }

    const [hour, minute] = timeParts.map(Number);
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return { valid: false, error: "Invalid time values" };
    }

    return { valid: true };
};

/**
 * Генерация уникального ключа для issue
 */
const generateIssueKey = (issue: ILocalIssue): string => {
    return `${issue.employee}.${issue.error_robot}.${dayjs(issue.error_start_time).format('YYYYMMDDHHmm')}`;
};

/**
 * Форматирование данных для копирования в буфер обмена
 */
const formatForClipboard = (issues: ILocalIssue[], type: WarehouseType): string => {
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
                "None",
                "",
                error.error_robot,
                error.issue_type,
                error.first_column,
                error.second_column,
                error.first_column,
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

// ==================== MAIN COMPONENT ====================

const Page = () => {
    // ==================== STATE ====================
    const [inputValue, setInputValue] = useState("");
    const [parsedIssues, setParsedIssues] = useState<ILocalIssue[]>([]);
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [isCopied, setIsCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ==================== REFS ====================
    const isSendingRef = useRef(false);
    const sentKeysRef = useRef(new Set<string>());
    const abortControllerRef = useRef<AbortController | null>(null);

    // ==================== STORE ====================
    const robots = useRobotsStore(state => state.robots);

    // ==================== PARSE LOGIC ====================
    const parseInput = useCallback(async () => {
        try {
            setParseErrors([]);
            setParsedIssues([]);

            const lines = inputValue
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (lines.length === 0) {
                toast.error("No data to parse");
                return;
            }

            const users = await getEmployeesList();
            if (!users) {
                throw new Error("Failed to fetch employees list");
            }

            const now = dayjs();
            let currentEmployee = "";
            const tempParsed: ILocalIssue[] = [];
            const tempErrors: string[] = [];

            lines.forEach((line, index) => {
                // Проверяем, является ли строка именем сотрудника
                const isUser = users.find((user: IUser) => user.user_name === line);
                if (isUser) {
                    currentEmployee = line;
                    return;
                }

                // Валидация формата строки
                const validation = validateErrorLine(line);
                if (!validation.valid) {
                    tempErrors.push(`Line ${index + 1}: ${validation.error} - "${line}"`);
                    return;
                }

                const parts = line.split(".");
                const [errorString, errorRobot, errorTime] = parts;

                // Пропускаем служебные строки
                if (errorString === "Translate") return;

                // Проверяем наличие сотрудника
                if (!currentEmployee) {
                    tempErrors.push(`Line ${index + 1}: No employee specified - "${line}"`);
                    return;
                }

                // Ищем паттерн ошибки
                const errorPattern = errors_data.find(error =>
                    error.employee_title.toLowerCase().includes(errorString.toLowerCase())
                );

                if (!errorPattern) {
                    tempErrors.push(`Line ${index + 1}: Unknown error type "${errorString}" - ${line}`);
                    return;
                }

                // Парсим время
                const startTime = parseErrorTime(errorTime, now);
                const endTime = startTime.add(errorPattern.solving_time, 'minute');

                // Определяем тип робота
                const robotState = robots.find(robot =>
                    Number(robot.robot_number) === Number(errorRobot)
                );

                const issue: ILocalIssue = {
                    employee: currentEmployee,
                    first_column: errorPattern.first_column,
                    second_column: errorPattern.second_column,
                    error_robot: errorRobot,
                    error_start_time: startTime.toDate(),
                    error_end_time: endTime.toDate(),
                    recovery_title: errorPattern.recovery_title,
                    solving_time: errorPattern.solving_time,
                    device_type: robotState?.robot_type || "Unknown",
                    issue_type: errorPattern.issue_type,
                    issue_description: errorPattern.issue_description,
                };

                tempParsed.push(issue);
            });

            setParsedIssues(tempParsed);
            setParseErrors(tempErrors);

            if (tempParsed.length > 0) {
                toast.success(`Parsed ${tempParsed.length} issue${tempParsed.length > 1 ? 's' : ''}`);
            }
            if (tempErrors.length > 0) {
                toast.warning(`${tempErrors.length} error${tempErrors.length > 1 ? 's' : ''} during parsing`);
            }

        } catch (error) {
            console.error("Parse error:", error);
            toast.error(error instanceof Error ? error.message : "Unknown parsing error");
        }
    }, [inputValue, robots]);

    // ==================== SAVE TO SERVER ====================
    useEffect(() => {
        // Защита от повторного запуска
        if (!parsedIssues || parsedIssues.length === 0 || isSendingRef.current) {
            return;
        }

        const saveToServer = async () => {
            try {
                isSendingRef.current = true;
                setIsSaving(true);

                // Создаем AbortController для возможности отмены
                abortControllerRef.current = new AbortController();

                const users = await getEmployeesList();
                if (!users) {
                    throw new Error("Failed to fetch employees list");
                }

                // Фильтруем только новые issues
                const newIssues = parsedIssues.filter(issue => {
                    const key = generateIssueKey(issue);
                    if (sentKeysRef.current.has(key)) {
                        return false;
                    }
                    sentKeysRef.current.add(key);
                    return true;
                });

                if (newIssues.length === 0) {
                    return;
                }

                // Последовательная отправка с задержкой
                let successCount = 0;
                let errorCount = 0;

                for (let i = 0; i < newIssues.length; i++) {
                    // Проверяем, не отменена ли операция
                    if (abortControllerRef.current?.signal.aborted) {
                        break;
                    }

                    const issue = newIssues[i];

                    // Задержка между запросами (кроме первого)
                    if (i > 0) {
                        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
                    }

                    try {
                        const user = users.find((u: IUser) => u.user_name === issue.employee);
                        if (!user) {
                            console.warn(`User not found: ${issue.employee}`);
                            errorCount++;
                            continue;
                        }

                        const shift = getInitialShiftByTime(issue.error_start_time);

                        await addNewException({
                            data: {
                                ...issue,
                                add_by: user.card_id.toString(),
                                shift_type: shift,
                                uniq_key: generateIssueKey(issue)
                            }
                        });

                        successCount++;
                    } catch (error) {
                        console.error(`Failed to save issue ${i + 1}:`, error);
                        errorCount++;
                    }
                }

                // Отображаем результат
                if (successCount > 0) {
                    toast.success(`Successfully saved ${successCount} exception${successCount > 1 ? 's' : ''}`);
                }
                if (errorCount > 0) {
                    toast.error(`Failed to save ${errorCount} exception${errorCount > 1 ? 's' : ''}`);
                }

            } catch (error) {
                console.error("Save error:", error);
                toast.error(error instanceof Error ? error.message : "Failed to save exceptions");
            } finally {
                isSendingRef.current = false;
                setIsSaving(false);
                abortControllerRef.current = null;
            }
        };

        saveToServer();

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [parsedIssues]);

    // ==================== CLIPBOARD OPERATIONS ====================
    const copyToClipboard = useCallback((type: WarehouseType) => {
        if (parsedIssues.length === 0) {
            toast.error("No data to copy");
            return;
        }

        const content = formatForClipboard(parsedIssues, type);

        navigator.clipboard.writeText(content)
            .then(() => {
                setIsCopied(true);
                toast.success(`Copied ${type} format to clipboard`);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch((error) => {
                console.error("Copy failed:", error);
                toast.error("Failed to copy to clipboard");
            });
    }, [parsedIssues]);

    // ==================== CLEAR FUNCTION ====================
    const handleClear = useCallback(() => {
        setInputValue("");
        setParsedIssues([]);
        setParseErrors([]);
        setIsCopied(false);
        sentKeysRef.current.clear();
        isSendingRef.current = false;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    // ==================== RENDER ====================
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-4">
                <div className="">
                    <div>
                        <Textarea
                            placeholder="取放箱位置错误 Wrong pick and place box position. **** . 07:43"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className={`font-mono text-sm max-h-[150px]`}
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button onClick={parseInput} disabled={!inputValue.trim() || isSaving}>
                        <FileText className="w-4 h-4 mr-2" />
                        Parse Data
                    </Button>
                    <ButtonGroup>
                        <Button
                            onClick={handleClear}
                            variant="outline"
                            disabled={isSaving}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                        <TemplateInfo />
                    </ButtonGroup>
                </div>
            </div>

            {/* Parse Errors Section */}
            {parseErrors.length > 0 && (
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                    <h3 className="text-destructive font-bold mb-2">
                        Parse Errors ({parseErrors.length})
                    </h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {parseErrors.map((error, index) => (
                            <li key={index} className="break-all">{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Results Section */}
            {parsedIssues.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold">
                                Results: {parsedIssues.length} issue{parsedIssues.length > 1 ? 's' : ''}
                            </h2>
                            {isSaving && (
                                <p className="text-sm text-muted-foreground">
                                    Saving to server...
                                </p>
                            )}
                        </div>

                        <ButtonGroup>
                            <Button
                                onClick={() => copyToClipboard("GLPC")}
                                variant={isCopied ? "secondary" : "default"}
                                disabled={isSaving}
                            >
                                {isCopied ? (
                                    <Check className="w-4 h-4 mr-2" />
                                ) : (
                                    <Copy className="w-4 h-4 mr-2" />
                                )}
                                {isCopied ? "Copied!" : "Copy"}
                            </Button>
                        </ButtonGroup>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead>Robot</TableHead>
                                    <TableHead>Error</TableHead>
                                    <TableHead>Recovery</TableHead>
                                    <TableHead>Start</TableHead>
                                    <TableHead>End</TableHead>
                                    <TableHead>Gap (min)</TableHead>
                                    <TableHead>Operator</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedIssues.map((error, i) => {
                                    const isHighRobot = Number(error.error_robot) > 150;
                                    const timeDiff = dayjs(error.error_end_time).diff(
                                        error.error_start_time,
                                        'minute'
                                    );

                                    return (
                                        <TableRow key={i}>
                                            <TableCell className="font-bold">
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <Image
                                                            src={isHighRobot ? `/img/K50H_red.svg` : `/img/A42T_red.svg`}
                                                            alt="robot"
                                                            width={30}
                                                            height={30}
                                                        />
                                                    </div>
                                                    <article>
                                                        {error.error_robot} - {error.device_type}
                                                    </article>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">
                                                    {error.first_column}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {error.second_column}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">
                                                    {error.issue_description}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {error.recovery_title}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(error.error_start_time).format("HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(error.error_end_time).format("HH:mm")}
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {timeDiff}
                                            </TableCell>
                                            <TableCell>{error.employee}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;