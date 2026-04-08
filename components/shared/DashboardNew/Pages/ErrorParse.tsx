import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { getWorkDate } from "@/futures/date/getWorkDate";
import dayjs from "dayjs";
import { getInitialShift } from "@/futures/date/getInitialShift";
import { getEmployeesList } from "@/futures/user/getEmployees";
import { getExceptionsTemplates } from "@/futures/exception/getExceptionsTemplates";
import { useSessionStore } from "@/store/session";
import { toast } from "sonner";
import { useRobotsStore } from "@/store/robotsStore";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {AlertCircleIcon, Loader, Moon, Sun, Copy, Send, FileSpreadsheet} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button"; // предполагается наличие компонента Button
import { IRobotException } from "@/types/Exception/Exception";
import { ExceptionService } from "@/services/exceptionService";

const ErrorParse = () => {
    const session = useSessionStore(state => state.currentSession);
    const robots_list = useRobotsStore(state => state.robots);

    const [input_value, setInput_value] = useState<string>("");
    const [parsed_data, setParsed_data] = useState<Partial<IRobotException>[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors_state, setErrors_state] = useState<string[]>([]);
    const [parse_date, setParse_date] = useState<Date>(getWorkDate(dayjs().toDate()));
    const [parse_shift, setParse_shift] = useState<string>(getInitialShift());

    // Ref для debounce таймера
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const getParse = useCallback(async () => {
        setIsLoading(true);

        if (!session) {
            toast.error('No current session');
            setIsLoading(false);
            return;
        }

        if (!robots_list) {
            toast.error('No robots for this session');
            setIsLoading(false);
            return;
        }

        const employees_list = await getEmployeesList();
        const issue_templates = await getExceptionsTemplates();

        const sliced = input_value.split('\n');

        let current_user = '';
        let current_user_card = 0;
        const issues: Partial<IRobotException>[] = [];
        const errors: string[] = [];

        for (let i = 0; i < sliced.length; i++) {
            const issueParts = sliced[i].split('.');

            if (issueParts.length > 2) {
                const [rawTitle, rawNumber, rawTime] = issueParts;
                const robot_type = robots_list?.find(robot => Number(robot.robot_number) === Number(rawNumber))?.robot_type;
                const issue_template = issue_templates.find(t => rawTitle.includes(t.employee_title));

                const start_date = `${dayjs(parse_date).format('YYYY-MM-DD')}T${rawTime.trim()}:00.000`;
                const end_date = dayjs(`${dayjs(parse_date).format('YYYY-MM-DD')} ${rawTime.trim()}`)
                    .add(issue_template?.solving_time ?? 0, 'minute')
                    .format('YYYY-MM-DDTHH:mm:ss.SSS');

                const obj: Partial<IRobotException> = {
                    issue_data: dayjs(parse_date).format('YYYY-MM-DD'),
                    issue_warehouse: 'C2',
                    device_type: robot_type ?? "None",
                    error_robot: Number(rawNumber.trim()),
                    issue_type: issue_template?.equipment_type,
                    first_column: issue_template?.issue_type,
                    second_column: issue_template?.issue_sub_type,
                    issue_description: issue_template?.issue_description,
                    recovery_title: issue_template?.recovery_title,
                    error_start_time: start_date,
                    error_end_time: end_date,
                    solving_time: issue_template?.solving_time,
                    add_by: current_user_card,
                    employee: current_user,
                    uniq_key: `${session?.user.user_name}.${Number(rawNumber.trim())}.${start_date}`,
                    shift_type: parse_shift,
                    warehouse: session?.warehouse.title,
                };

                issues.push(obj);
            } else {
                const isUser = employees_list.find(employee => employee.user_name === sliced[i]);
                if (isUser === undefined) {
                    errors.push(sliced[i]);
                    continue;
                }
                current_user = isUser.user_name;
                current_user_card = isUser.card_id;
            }
        }

        setParsed_data(issues);
        setErrors_state(errors);
        setIsLoading(false);
    }, [input_value, session, robots_list, parse_date, parse_shift]);

    // Debounce: вызываем getParse через 500 мс после остановки ввода
    useEffect(() => {
        if (input_value.length > 1) {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                getParse();
            }, 500);
        } else {
            setParsed_data([]);
            setErrors_state([]);
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [input_value, getParse]);

    // Отправка всех исключений на сервер
    const handleSendToServer = async () => {
        if (parsed_data.length === 0) {
            toast.warning('Нет данных для отправки');
            return;
        }

        setIsSubmitting(true);
        let successCount = 0;
        let errorCount = 0;

        for (const issue of parsed_data) {
            try {
                await ExceptionService.addException(issue);
                successCount++;
            } catch (error) {
                console.error('Ошибка отправки:', error);
                errorCount++;
            }
        }

        setIsSubmitting(false);

        if (errorCount === 0) {
            toast.success(`Успешно отправлено ${successCount} записей`);
        } else {
            toast.error(`Отправлено: ${successCount}, ошибок: ${errorCount}`);
        }
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        return dayjs(isoString).format('HH:mm');
    };

    const handleCopyForExcel = async () => {
        if (parsed_data.length === 0) {
            toast.warning('Нет данных для копирования');
            return;
        }

        const rows = parsed_data.map(item => [
            item.issue_data || '',
            item.issue_warehouse || '',
            item.device_type || '',
            item.error_robot?.toString() || '',
            item.issue_type || '',
            item.first_column || '',
            item.second_column || '',
            item.issue_description || '',
            item.first_column || '',
            item.recovery_title || '',
            item.employee || '',
            formatTime(item.error_start_time),
            formatTime(item.error_end_time),
            item.solving_time?.toString() || '',
            item.employee || ''
        ]);

        const tsvContent = [
            ...rows.map(row => row.join('\t'))
        ].join('\n');

        try {
            await navigator.clipboard.writeText(tsvContent);
            toast.success('Данные скопированы в формате Excel (вставьте в таблицу)');
        } catch (err) {
            toast.error('Не удалось скопировать данные');
        }
    };

    return (
        <div className={`flex items-start flex-wrap md:flex-nowrap gap-4`}>
            <div className={`w-full`}>
                <div className={`flex gap-2 items-center mb-2`}>
                    {parse_shift === "day"
                        ? <div className={`text-xs flex items-center gap-2`}><Sun size={20} className="text-amber-500"/> Day Shift</div>
                        : <div className={`text-xs flex items-center gap-2`}><Moon size={20} className="text-blue-400"/> Night Shift</div>
                    }
                    <p className={`text-muted-foreground text-xs`}>{dayjs(parse_date).format('MM/DD/YYYY')}</p>
                </div>
                <Textarea
                    value={input_value}
                    onChange={(e) => setInput_value(e.target.value)}
                    className="max-h-[100px] focus:max-h-[350px] transition-[max-height] duration-300 ease-in-out"
                    placeholder="Вставьте текст из Lark..."
                />
                <p className={`text-xs text-muted-foreground mt-2`}>
                    Пожалуйста, скопируйте текст из Lark в поле выше. Парсинг выполнится автоматически с задержкой.
                </p>

                <div className={`flex gap-2 my-2`}>
                    {errors_state.map((error, index) => {
                        if (error.trim().length < 1) return null;
                        return (
                            <Alert variant="destructive" key={index}>
                                <AlertCircleIcon />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        );
                    })}
                </div>

                <div className="flex gap-2 mb-4">
                    <Button onClick={handleCopyForExcel} disabled={parsed_data.length === 0} variant="outline" size="sm">
                        <FileSpreadsheet className="mr-1 h-4 w-4" /> Копировать для Excel
                    </Button>
                    <Button onClick={handleSendToServer} disabled={parsed_data.length === 0 || isSubmitting} size="sm">
                        {isSubmitting ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                        {isSubmitting ? 'Отправка...' : 'Отправить на сервер'}
                    </Button>
                </div>

                {isLoading && (
                    <Alert className={`mt-2`}>
                        <Loader className={`animate-spin`} />
                        <AlertTitle>Процесс парсинга</AlertTitle>
                        <AlertDescription>
                            Мы подготавливаем распарсенные данные...
                        </AlertDescription>
                    </Alert>
                )}

                {!isLoading && parsed_data.length > 0 && (
                    <div className={`overflow-hidden mt-4`}>
                        <Table>
                            <TableBody>
                                {parsed_data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.issue_data}</TableCell>
                                        <TableCell className="font-medium">{item.issue_warehouse}</TableCell>
                                        <TableCell className="font-medium">{item.device_type}</TableCell>
                                        <TableCell className="font-medium">{item.error_robot}</TableCell>
                                        <TableCell className="font-medium">{item.issue_type}</TableCell>
                                        <TableCell>
                                            <div className={`grid grid-cols-2 gap-2`}>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">{item.first_column}</p>
                                                    <p className="text-xs text-muted-foreground">{item.second_column}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">{item.issue_description}</p>
                                                    <p className="text-xs text-muted-foreground">{item.recovery_title}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.error_start_time}</TableCell>
                                        <TableCell className="font-medium">{item.error_end_time}</TableCell>
                                        <TableCell className="font-medium">{item.solving_time}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorParse;