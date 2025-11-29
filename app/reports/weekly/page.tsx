'use client'
import React, {useEffect, useState, useMemo} from 'react';
import * as XLSX from 'xlsx';
import RobotsSummaryCard from "@/components/shared/reports/RobotsSummaryCard";
import FileUpload from "@/components/shared/reports/FileUpload";
import {Button} from "@/components/ui/button";
import {generateWeeklyReport} from "@/futures/PDF/weekly";
import dayjs from "dayjs";

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

const calculateSummary = (robots: RobotStats[]): RobotSummary => {
    if (robots.length === 0) return createEmptySummary();

    const totalMinutes = robots.length * TOTAL_MINUTES_PER_ROBOT;

    const totals = robots.reduce((acc, robot) => ({
        work_time: acc.work_time + robot.work_time,
        charge_time: acc.charge_time + robot.charge_time,
        offline_time: acc.offline_time + robot.offline_time,
        abnormal_time: acc.abnormal_time + robot.abnormal_time,
        idle_time: acc.idle_time + robot.idle_time,
    }), {
        work_time: 0,
        charge_time: 0,
        offline_time: 0,
        abnormal_time: 0,
        idle_time: 0,
    });

    return {
        total_robots: robots.length,
        working_hours: totals.work_time,
        charge_hours: totals.charge_time,
        total_offline: totals.offline_time,
        total_abnormal: totals.abnormal_time,
        total_idle: totals.idle_time,
        working_hours_percentage: (totals.work_time / totalMinutes) * 100,
        charge_hours_percentage: (totals.charge_time / totalMinutes) * 100,
        total_offline_percentage: (totals.offline_time / totalMinutes) * 100,
        total_abnormal_percentage: (totals.abnormal_time / totalMinutes) * 100,
        total_idle_percentage: (totals.idle_time / totalMinutes) * 100,
    };
};

const isValidExcelFile = (file: File): boolean => {
    return VALID_FILE_TYPES.includes(file.type) ||
        /\.(xlsx|xls|ods)$/i.test(file.name);
};

const processRobotData = (rows: any[][]): RobotStats[] => {
    const robotsMap = new Map<string, RobotStats>();

    rows.forEach((row) => {
        const record = {
            robotId: row[0],
            robotType: row[1],
            date: row[3],
            work_time: parseFloat(row[5]) || 0,
            charge_time: parseFloat(row[6]) || 0,
            offline_time: parseFloat(row[7]) || 0,
            abnormal_time: parseFloat(row[8]) || 0,
            idle_time: parseFloat(row[9]) || 0
        };

        let robot = robotsMap.get(record.robotId);

        if (!robot) {
            robot = {
                robotId: record.robotId,
                robotType: record.robotType,
                count: 0,
                work_time: 0,
                charge_time: 0,
                offline_time: 0,
                abnormal_time: 0,
                idle_time: 0,
                dates: new Set<string>()
            };
            robotsMap.set(record.robotId, robot);
        }

        robot.count++;
        robot.work_time += record.work_time;
        robot.charge_time += record.charge_time;
        robot.offline_time += record.offline_time;
        robot.abnormal_time += record.abnormal_time;
        robot.idle_time += record.idle_time;
        robot.dates.add(record.date);
    });

    return Array.from(robotsMap.values());
};

function excelDateToJSDate(serial: number): Date {
    const utc_days = serial - 25569;
    const utc_value = utc_days * 86400; // секунд в сутках
    return new Date(utc_value * 1000);
}

// ============= COMPONENT =============
const Page: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [exception_file, setException_file] = useState<File | null>(null);
    const [data, setData] = useState<ExcelData | null>(null);
    const [processedData, setProcessedData] = useState<RobotStats[]>([]);

    const [exceptions_data, setExceptions_data] = useState<ExceptionRecord[]>([])

    // Используем useMemo для вычисления сводок
    const summaries = useMemo(() => {
        const robotsByType = {
            [ROBOT_TYPES.KUBOT]: processedData.filter(r => r.robotType === ROBOT_TYPES.KUBOT),
            [ROBOT_TYPES.MINI]: processedData.filter(r => r.robotType === ROBOT_TYPES.MINI),
            [ROBOT_TYPES.E2]: processedData.filter(r => r.robotType === ROBOT_TYPES.E2),
        };

        return {
            total: calculateSummary(processedData),
            kubot: calculateSummary(robotsByType[ROBOT_TYPES.KUBOT]),
            mini: calculateSummary(robotsByType[ROBOT_TYPES.MINI]),
            e2: calculateSummary(robotsByType[ROBOT_TYPES.E2]),
        };
    }, [processedData]);

    const processFile = (selectedFile: File) => {
        if (!isValidExcelFile(selectedFile)) {
            alert('Пожалуйста, загрузите Excel файл (.xlsx, .xls, .ods)');
            return;
        }

        setFile(selectedFile);

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

                const robotStats = processRobotData(rows);
                setProcessedData(robotStats.slice(1));
            } catch (error) {
                console.error('Ошибка обработки файла:', error);
                alert('Ошибка при обработке файла');
            }
        };

        reader.readAsBinaryString(selectedFile);
    };

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
                    console.log(Meline);
                    const obj = {
                        exception_date: excelDateToJSDate(Meline[0]) || 0,
                        warehouse: Meline[1] || "",
                        robot_type: Meline[2] || "",
                        robot_number: Meline[3] || "",
                        exception_type: Meline[4] || "",
                        error_1: Meline[5] || "",
                        error_2: Meline[6] || "",
                        error_description: Meline[8] || "",
                        error_recovery: Meline[9] || "",
                        employee: Meline[10] || "",
                        start_time: excelDateToJSDate(Meline[11]) || "",
                        end_time: excelDateToJSDate(Meline[12]) || "",
                    };

                    data.push(obj);
                });


                setExceptions_data(data as ExceptionRecord[]);

                //const robotStats = processRobotData(rows);
                //setProcessedData(robotStats.slice(1));
            } catch (error) {
                console.error('Ошибка обработки файла:', error);
                alert('Ошибка при обработке файла');
            }
        };

        reader.readAsBinaryString(selectedFile);
    };

    const handlePDF = async () => {
        try {
            console.log(processedData);
            await generateWeeklyReport({summaries, processedData})
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (file) {
            processFile(file);
        } else {
            setProcessedData([]);
        }
    }, [file]);

    useEffect(() => {
        if (exception_file) {
            processExceptionsFile(exception_file);
        } else {
            setProcessedData([]);
        }
    }, [exception_file]);

    return (
        <div className="p-8 grid grid-cols-[350px_1fr] gap-8">
            <div className="mb-4">
                <div className="flex flex-col gap-4 mb-4">
                    <FileUpload
                        file={file}
                        title="Robots Data"
                        setFile={setFile}
                    />
                    <FileUpload
                        file={exception_file}
                        title="Exception Data"
                        setFile={setException_file}
                    />
                </div>

                {processedData.length > 0 && (
                    <>
                        <div className="my-4">
                            <Button onClick={handlePDF} className="w-full">
                                PDF Export
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-6">
                            <RobotsSummaryCard
                                title="Total"
                                summary_data={summaries.total}
                            />
                            <RobotsSummaryCard
                                title="RT Kubot"
                                summary_data={summaries.kubot}
                            />
                            <RobotsSummaryCard
                                title="RT Kubot Mini"
                                summary_data={summaries.mini}
                            />
                            <RobotsSummaryCard
                                title="RT Kubot E2"
                                summary_data={summaries.e2}
                            />
                        </div>
                    </>
                )}
            </div>

            <div>
                {exceptions_data.length > 0 && (
                    <div>
                        <div className="overflow-x-auto">
                            <h4 className="font-semibold mb-3">Robots Data:</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            exception_date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            warehouse
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            robot_type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            robot_number
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            exception_type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            error_1
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            error_2
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            error_description
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
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {exceptions_data.slice(0, 5).map((exception, rowIndex) => (
                                        <tr key={rowIndex} className="hover:bg-primary">
                                            <td className="px-4">{dayjs(exception.exception_date).format("YYYY/MM/DD")}</td>
                                            <td className="px-4">{exception.warehouse}</td>
                                            <td className="px-4">{exception.robot_type}</td>
                                            <td className="px-4">{exception.robot_number}</td>
                                            <td className="px-4">{exception.exception_type}</td>
                                            <td className="px-4">
                                                <p className={`line-clamp-1`}>{exception.error_1}</p>
                                            </td>
                                            <td className="px-4">
                                                <p className={`line-clamp-1`}>{exception.error_2}</p>
                                            </td>
                                            <td className="px-4">
                                                <p className={`line-clamp-1`}>{exception.error_description}</p>
                                            </td>
                                            <td className="px-4">
                                                <p className={`line-clamp-1`}>{exception.error_recovery}</p>
                                            </td>
                                            <td className="px-4">{exception.employee}</td>
                                            <td className="px-4">{dayjs(exception.start_time).format("HH:mm")}</td>
                                            <td className="px-4">{dayjs(exception.end_time).format("HH:mm")}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {processedData.length > 0 && (
                    <div>
                        <div className="overflow-x-auto">
                            <h4 className="font-semibold mb-3">Robots Data:</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            Robot Number
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            Robot Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            Work Time (m)
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            Charge Time (m)
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            Offline Time (m)
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            Abnormal Time (m)
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                            Idle Time (m)
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {processedData.slice(0, 25).map((robot, rowIndex) => (
                                        <tr key={robot.robotId} className="hover:bg-primary">
                                            <td className="px-4">{robot.robotId}</td>
                                            <td className="px-4">{robot.robotType}</td>
                                            <td className="px-4">{robot.work_time.toFixed(2)}</td>
                                            <td className="px-4">{robot.charge_time.toFixed(2)}</td>
                                            <td className="px-4">{robot.offline_time.toFixed(2)}</td>
                                            <td className="px-4">{robot.abnormal_time.toFixed(2)}</td>
                                            <td className="px-4">{robot.idle_time.toFixed(2)}</td>
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