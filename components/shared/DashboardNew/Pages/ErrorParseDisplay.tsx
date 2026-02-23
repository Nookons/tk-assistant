import React, {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from "sonner";
import errors_data_raw from "@/utils/ErrorsPatterns/ErrorsPatterns.json";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import {ILocalIssue, JsonError} from "@/types/Exception/ExceptionParse";
import { useRobotsStore } from "@/store/robotsStore";
import {getEmployeesList} from "@/futures/user/getEmployees";
import {IUser} from "@/types/user/user";
import {
    validateErrorLine,
    validateErrorLineP3
} from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/ValidateErrorLine";
import {parseErrorTime} from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/ParseErrorTime";
import {generateIssueKey} from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/GenerateIssueKey";
import {getInitialShiftByTime} from "@/futures/date/getInitialShift";
import {addNewException} from "@/futures/exception/addNewException";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Check, Copy, FileText, Trash2} from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import TemplateInfo from "@/components/shared/ErrorParse/TemplateInfo";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
    formatForClipboard,
    WarehouseType
} from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/FormatForClipboard";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {useQuery} from "@tanstack/react-query";
import {getExceptionsTemplates} from "@/futures/exception/getExceptionsTemplates";
import {IRobot} from "@/types/robot/robot";
import Image from 'next/image'

dayjs.extend(duration);
dayjs.extend(utc);

const errors_data = errors_data_raw as JsonError[];
const REQUEST_DELAY = 150; // ms between requests

const ErrorParseProvider = () => {
    const [inputValue, setInputValue] = useState("");
    const [parsedIssues, setParsedIssues] = useState<ILocalIssue[]>([]);
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [isCopied, setIsCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [warehouse, setWarehouse] = useState<string>('GLPC')

    const robots = useRobotsStore(state => state.robots);

    const [p3_robots, setP3_robots] = useState<IRobot[]>([])
    const [glpc_robots, setGlpc_robots] = useState<IRobot[]>([])

    useEffect(() => {
        if (robots) {
            const p3_result = robots.filter(robot => robot.warehouse.toUpperCase() === 'P3')
            const glpc_result = robots.filter(robot => robot.warehouse.toUpperCase() === 'GLPC')
            setP3_robots(p3_result)
            setGlpc_robots(glpc_result)
        }
    }, [robots]);

    const {data: templates_data, isLoading, isError} = useQuery({
        queryKey: ['exception-templates'],
        queryFn: async () => getExceptionsTemplates(),
        retry: false,
    })

    const isSendingRef = useRef(false);
    const sentKeysRef = useRef(new Set<string>());
    const abortControllerRef = useRef<AbortController | null>(null);

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

            if (!templates_data) return toast.error('No templates data. Try again later')

            console.log(templates_data);

            lines.forEach((line, index) => {
                const isUser = users.find((user: IUser) => user.user_name === line);

                if (isUser) {
                    currentEmployee = line;
                    return;
                }

                const validation_glpc = validateErrorLine(line);

                if (!validation_glpc.valid) {
                    const validation_p3 = validateErrorLineP3(line);

                    if (!validation_p3.valid) {
                        tempErrors.push(`Line ${index + 1}: ${validation_glpc.error} - "${line}"`);
                        return;
                    }

                    const [robot_number, error_type, error_sub_type, recovery_text, errorTime] = line.trim().split(".");

                    const errorPattern = templates_data
                        .filter(t => error_sub_type.toLowerCase().includes(t.employee_title.toLowerCase()))
                        .sort((a, b) => b.employee_title.length - a.employee_title.length)[0]; // наиболее точное совпадение

                    if (!errorPattern) {
                        tempErrors.push(`Line ${index + 1}: Unknown error type "${error_sub_type}"`);
                        return;
                    }

                    const startTime = parseErrorTime(errorTime, now);
                    const endTime   = startTime.add(errorPattern.solving_time, 'minute');
                    const robotType = p3_robots.find(r => Number(r.robot_number) === Number(robot_number))?.robot_type ?? "Unknown";

                    const issue: ILocalIssue = {
                        employee:          currentEmployee,
                        first_column:      errorPattern.issue_type,
                        second_column:     errorPattern.issue_sub_type,
                        error_robot:       robot_number,
                        error_start_time:  startTime.toDate(),
                        error_end_time:    endTime.toDate(),
                        recovery_title:    recovery_text,
                        solving_time:      errorPattern.solving_time,
                        device_type:       robotType,
                        issue_type:        errorPattern.equipment_type,
                        issue_description: error_sub_type,
                        warehouse:         'P3',
                    };

                    tempParsed.push(issue);
                    return;
                }

                console.log(line);
                const parts = line.split(".");
                const [errorString, errorRobot, errorTime] = parts;

                if (errorString === "Translate") return;

                if (!currentEmployee) {
                    tempErrors.push(`Line ${index + 1}: No employee specified - "${line}"`);
                    return;
                }

                const errorPattern = errors_data.find(error =>
                    error.employee_title.toLowerCase().includes(errorString.toLowerCase())
                );

                if (!errorPattern) {
                    tempErrors.push(`Line ${index + 1}: Unknown error type "${errorString}" - ${line}`);
                    return;
                }

                const startTime = parseErrorTime(errorTime, now);
                const endTime = startTime.add(errorPattern.solving_time, 'minute');

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
                    warehouse: 'GLPC',
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

    useEffect(() => {
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
        <div className="mx-auto space-y-6">
            <div className="space-y-4">
                <div className="">
                    <div className={`flex items-center gap-2 mb-2`}>
                        <p className={`text-xs text-muted-foreground`}>Robots P3: <span className={`font-bold text-foreground`}>{p3_robots.length.toLocaleString()}</span></p>
                        <p className={`text-xs text-muted-foreground`}>Robots GLPC: <span className={`font-bold text-foreground`}>{glpc_robots.length.toLocaleString()}</span></p>
                    </div>
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
                        <FileText className="w-4 h-4 mr-2"/>
                        Parse Data
                    </Button>
                    <ButtonGroup>
                        <Button
                            onClick={handleClear}
                            variant="outline"
                            disabled={isSaving}
                        >
                            <Trash2 className="w-4 h-4 mr-2"/>
                            Clear
                        </Button>

                        <TemplateInfo/>
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
                                    <Check className="w-4 h-4 mr-2"/>
                                ) : (
                                    <Copy className="w-4 h-4 mr-2"/>
                                )}
                                {isCopied ? "Copied!" : "Copy GLPC"}
                            </Button>
                            <Button
                                onClick={() => copyToClipboard("P3")}
                                variant={isCopied ? "secondary" : "default"}
                                disabled={isSaving}
                            >
                                {isCopied ? (
                                    <Check className="w-4 h-4 mr-2"/>
                                ) : (
                                    <Copy className="w-4 h-4 mr-2"/>
                                )}
                                {isCopied ? "Copied!" : "Copy P3"}
                            </Button>
                        </ButtonGroup>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead>Warehouse</TableHead>
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
                                    let robot_type;

                                    if (error.warehouse === 'P3') {
                                        const robot = p3_robots.find(r => Number(r.robot_number) === Number(error.error_robot));
                                        robot_type = robot?.robot_type ?? "Unknown";
                                    } else {
                                        const robot = glpc_robots.find(r => Number(r.robot_number) === Number(error.error_robot));
                                        robot_type = robot?.robot_type ?? "Unknown";
                                    }


                                    const timeDiff = dayjs(error.error_end_time).diff(
                                        error.error_start_time,
                                        'minute'
                                    );

                                    return (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <p className={`line-clamp-1 text-xs`}>{error.warehouse}</p>
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <Image
                                                            src={robot_type === "K50H" ? `/img/K50H_red.svg` : `/img/A42T_red.svg`}
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
                                                <p className={`line-clamp-1 text-xs`}>{error.first_column}</p>
                                                <p className={`line-clamp-1 text-xs`}>{error.second_column}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className={`line-clamp-1 text-xs`}>{error.issue_description}</p>
                                                <p className={`line-clamp-1 text-xs`}>{error.recovery_title}</p>
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

export default ErrorParseProvider;