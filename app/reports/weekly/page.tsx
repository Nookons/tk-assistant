'use client'
import React, {useEffect, useState, useMemo} from 'react';
import * as XLSX from 'xlsx';
import RobotsSummaryCard from "@/components/shared/reports/RobotsSummaryCard";
import FileUpload from "@/components/shared/reports/FileUpload";
import {Button} from "@/components/ui/button";
import {generateWeeklyReport} from "@/futures/PDF/weekly";
import dayjs from "dayjs";
import ShiftStats from "@/components/shared/dashboard/ShiftStats/ShiftStats";
import MonthStats from "@/components/shared/dashboard/ShiftStats/MonthStats";
import {IHistoryParts, IRobot} from "@/types/robot/robot";

// ============= TYPES =============
interface ExcelData {
    sheetName: string;
    headers: string[];
    rows: any[][];
    totalRows: number;
    totalColumns: number;
}

interface RobotStats {
    robotId: string;
    robotType: string;
    count: number;
    work_time: number;
    charge_time: number;
    offline_time: number;
    abnormal_time: number;
    idle_time: number;
    dates: Set<string>;
}

interface RobotSummary {
    total_robots: number;
    working_hours: number;
    charge_hours: number;
    total_offline: number;
    total_abnormal: number;
    total_idle: number;
    working_hours_percentage: number;
    charge_hours_percentage: number;
    total_offline_percentage: number;
    total_abnormal_percentage: number;
    total_idle_percentage: number;
}

// ============= CONSTANTS =============
const TOTAL_MINUTES_PER_ROBOT = 10080; // 7.5 days in minutes (180 hours)
const VALID_FILE_TYPES = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet'
];
const ROBOT_TYPES = {
    KUBOT: 'RT_KUBOT',
    MINI: 'RT_KUBOT_MINI_HAIFLEX',
    E2: 'RT_KUBOT_E2'
} as const;

export interface ExceptionRecord {
    exception_date: string;      // "2025-11-19T00:00:00.000Z"
    warehouse: string;           // "Inventory Warehouse"
    robot_type: string;          // "K50H"
    robot_number: number;        // 567
    exception_type: string;      // "设备Equipment"
    error_1: string;             // "行走异常Unable to drive"
    error_2: string;             // "地面码脏污 Ground code dirty"
    error_description: string;   // "行走异常Unable to drive"
    error_recovery: string;      // "Clean the ground code and retry"
    employee: string;            // "Dmytro Kolomiiets"
    start_time: string;          // "1899-12-30T06:25:00.000Z"
    end_time: string;            // "1899-12-30T06:26:00.000Z"
    gap: number;            // "1899-12-30T06:26:00.000Z"
}


// ============= UTILITY FUNCTIONS =============
const createEmptySummary = (): RobotSummary => ({
    total_robots: 0,
    working_hours: 0,
    charge_hours: 0,
    total_offline: 0,
    total_abnormal: 0,
    total_idle: 0,
    working_hours_percentage: 0,
    charge_hours_percentage: 0,
    total_offline_percentage: 0,
    total_abnormal_percentage: 0,
    total_idle_percentage: 0,
});


const isValidExcelFile = (file: File): boolean => {
    return VALID_FILE_TYPES.includes(file.type) ||
        /\.(xlsx|xls|ods)$/i.test(file.name);
};


// Функция для конвертации Excel ДАТЫ (включая китайский формат)
const excelDateToJSDate = (excelDate: any): Date | null => {
    console.log('Raw Excel date value:', excelDate, 'Type:', typeof excelDate);

    // Если это уже Date объект
    if (excelDate instanceof Date) {
        return excelDate;
    }

    // Если это строка с китайскими символами (例: 2025年12月29日)
    if (typeof excelDate === 'string') {
        // Проверяем на китайский формат
        const chineseMatch = excelDate.match(/(\d+)年(\d+)月(\d+)日/);
        if (chineseMatch) {
            const [_, year, month, day] = chineseMatch;
            const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            console.log('✅ Parsed Chinese date:', dateStr);
            return dayjs(dateStr).toDate();
        }

        // Обычная строка даты
        const parsed = new Date(excelDate);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    // Если это число (Excel serial date)
    if (typeof excelDate === 'number') {
        const date = dayjs('1899-12-30').add(Math.floor(excelDate), 'day');
        return date.toDate();
    }

    return null;
};

// Функция для конвертации Excel ВРЕМЕНИ
const excelTimeToJSDate = (excelTime: any, baseDate: Date): Date | null => {
    console.log('Raw Excel time value:', excelTime, 'Type:', typeof excelTime);

    // Если это уже Date объект
    if (excelTime instanceof Date) {
        return excelTime;
    }

    // Если это строка времени (例: "14:30" или "2:30 PM")
    if (typeof excelTime === 'string') {
        const timeMatch = excelTime.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            const [_, hours, minutes] = timeMatch;
            return dayjs(baseDate)
                .hour(parseInt(hours))
                .minute(parseInt(minutes))
                .second(0)
                .toDate();
        }
    }

    // Если это число (Excel time fraction или serial datetime)
    if (typeof excelTime === 'number') {
        // Если число больше 1, это datetime (дата + время)
        if (excelTime > 1) {
            const date = dayjs('1899-12-30').add(excelTime, 'day');
            return date.toDate();
        }

        // Если число меньше 1, это только время (дробь дня)
        const totalMinutes = Math.round(excelTime * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return dayjs(baseDate).hour(hours).minute(minutes).second(0).toDate();
    }

    return null;
};

// ============= COMPONENT =============
const Page: React.FC = () => {
    const [exception_file, setException_file] = useState<File | null>(null);
    const [data, setData] = useState<ExcelData | null>(null);

    const [exceptions_data, setExceptions_data] = useState<ExceptionRecord[]>([])

    const [fixed_robots, setFixed_robots] = useState<IRobot[]>([])
    const [parts_history, setParts_history] = useState<IHistoryParts[]>([])

    const processExceptionsFile = (selectedFile: File) => {
        if (!isValidExcelFile(selectedFile)) {
            alert('Пожалуйста, загрузите Excel файл (.xlsx, .xls, .ods)');
            return;
        }

        const reader = new FileReader();


        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const workbook = XLSX.read(e.target?.result, {type: 'binary'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1}) as any[][];

                const headers = jsonData[0] as string[];
                const rows = jsonData.slice(1).filter(row =>
                    row.some(cell => cell !== undefined && cell !== '')
                );

                setData({
                    sheetName: firstSheetName,
                    headers: headers,
                    rows: rows,
                    totalRows: rows.length,
                    totalColumns: headers.length
                });

                let data: any[] = [];

                rows.forEach((Meline) => {
                    // Конвертируем дату исключения
                    const exceptionDate = excelDateToJSDate(Meline[0]) || new Date();

                    console.log('Exception date:', Meline[0], '->', exceptionDate);
                    console.log('Start time:', Meline[10]);
                    console.log('End time:', Meline[11]);

                    const obj = {
                        exception_date: exceptionDate,
                        warehouse: Meline[1] || "",
                        robot_type: Meline[2] || "",
                        robot_number: Meline[3] || "",
                        exception_type: Meline[4] || "",
                        error_1: Meline[5] || "",
                        error_2: Meline[6] || "",
                        error_description: Meline[8] || "",
                        error_recovery: Meline[9] || "",
                        employee: Meline[9] || "",
                        // Время привязываем к дате исключения
                        start_time: excelTimeToJSDate(Meline[10], exceptionDate) || exceptionDate,
                        end_time: excelTimeToJSDate(Meline[11], exceptionDate) || exceptionDate,
                        gap: Meline[12] || 6,
                    };

                    data.push(obj);
                });

                setExceptions_data(data as ExceptionRecord[]);

            } catch (error) {
                console.error('Ошибка обработки файла:', error);
                alert('Ошибка при обработке файла');
            }
        };

        reader.readAsBinaryString(selectedFile);
    };

    const handlePDF = async () => {
        try {
            console.log(parts_history);
            await generateWeeklyReport({exceptions_data, parts_history})
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const result: IHistoryParts[] = [];
        if (fixed_robots.length) {
            fixed_robots.forEach((robot) => {

                robot.parts_history.forEach((part) => {
                    result.push(part)
                })
            })
        }
        setParts_history(result)
    }, [fixed_robots]);

    useEffect(() => {
        console.log(parts_history);
    }, [parts_history]);

    useEffect(() => {
        if (exception_file) {
            processExceptionsFile(exception_file);
        } else {
            setException_file(null);
        }
    }, [exception_file]);


    return (
        <div className="p-8 grid grid-cols-[350px_1fr] gap-8">
            <div className="mb-4">
                <div className="flex flex-col gap-4 mb-4">
                    <FileUpload
                        file={exception_file}
                        title="Exception Data"
                        setFile={setException_file}
                    />
                </div>
                <div>
                    <Button onClick={handlePDF}>PDF</Button>
                </div>
                <div>
                    <MonthStats setFixed_robots={setFixed_robots}/>
                </div>
            </div>
            <div>
                {exceptions_data.length > 0 && (
                    <div>
                        <div className="overflow-x-auto">
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            exception_date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            robot_type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            robot_number
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            error_1
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            error_2
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            error_recovery
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            employee
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            start_time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            end_time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            Gap
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {exceptions_data.slice(0, 100).map((exception, rowIndex) => (
                                        <tr key={rowIndex} className="hover:bg-primary">
                                            <td className="px-4">{dayjs(exception.exception_date).format("YYYY/MM/DD")}</td>
                                            <td className="px-4 min-w-[150px]">{exception.robot_type}</td>
                                            <td className="px-4">{exception.robot_number}</td>
                                            <td className="px-4">
                                                <p className={`line-clamp-1`}>{exception.error_1}</p>
                                            </td>
                                            <td className="px-4">
                                                <p className={`line-clamp-1`}>{exception.error_2}</p>
                                            </td>
                                            <td className="px-4">
                                                <p className={`line-clamp-1`}>{exception.error_description}</p>
                                            </td>
                                            <td className="px-4 min-w-[200px]">
                                                <p className={`line-clamp-1`}>{exception.employee}</p>
                                            </td>
                                            <td className="px-4">{dayjs(exception.start_time).format("HH:mm")}</td>
                                            <td className="px-4">{dayjs(exception.end_time).format("HH:mm")}</td>
                                            <td className="px-4">{exception.gap}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;