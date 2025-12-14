import React, {useEffect, useState} from 'react';
import FileUpload from "@/components/shared/reports/FileUpload";
import * as XLSX from "xlsx";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import dayjs from "dayjs";

const VALID_FILE_TYPES = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet'
];

interface ExcelData {
    sheetName: string;
    headers: string[];
    rows: any[][];
    totalRows: number;
    totalColumns: number;
}

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

const isValidExcelFile = (file: File): boolean => {
    return VALID_FILE_TYPES.includes(file.type) ||
        /\.(xlsx|xls|ods)$/i.test(file.name);
};

function excelDateToJSDate(serial: number): Date {
    const utc_days = serial - 25569;
    const utc_value = utc_days * 86400; // секунд в сутках
    return new Date(utc_value * 1000);
}

const SheinReportFile = () => {
    const [data, setData] = useState<ExcelData | null>(null);

    const [exception_file, setException_file] = useState<File | null>(null);
    const [exceptions_data, setExceptions_data] = useState<ExceptionRecord[]>([])

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
                        start_time: excelDateToJSDate(Meline[11])|| "",
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

    useEffect(() => {
        if (exception_file) {
            processExceptionsFile(exception_file);
        } else {
            setExceptions_data([]);
        }
    }, [exception_file]);

    useEffect(() => {
        console.log(exceptions_data);
    }, [exceptions_data]);

    return (
        <div>
            <FileUpload
                file={exception_file}
                title="Exception Data"
                setFile={setException_file}
            />
            <div>
                <Table>
                    <TableBody>
                        {exceptions_data.map((exception, idx) => {

                            if (!exception.robot_type) return;


                            return (
                                <TableRow key={idx}>
                                    <TableCell>{dayjs(exception.exception_date).format('YYYY/MM/DD')}</TableCell>
                                    <TableCell>{exception.warehouse}</TableCell>
                                    <TableCell>{exception.robot_type}</TableCell>
                                    <TableCell>{exception.robot_number}</TableCell>
                                    <TableCell>{exception.exception_type}</TableCell>
                                    <TableCell>{exception.error_1}</TableCell>
                                    <TableCell>{exception.error_2}</TableCell>
                                    <TableCell>{exception.error_description}</TableCell>
                                    <TableCell>{exception.error_recovery}</TableCell>
                                    <TableCell>{exception.employee}</TableCell>
                                    <TableCell>{dayjs(exception.start_time).format("HH:mm")}</TableCell>
                                    <TableCell>{dayjs(exception.end_time).format("HH:mm")}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default SheinReportFile;