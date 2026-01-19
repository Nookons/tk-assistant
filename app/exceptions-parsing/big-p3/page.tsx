'use client'
import React, {useState} from 'react';
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Copy, Check, FileText} from "lucide-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import Image from "next/image";
import {ButtonGroup} from "@/components/ui/button-group"

import errors_data_raw from '../../../utils/ErrorsPatterns/ErrorsPatterns.json'
import {getWorkDate} from "@/futures/Date/getWorkDate";

dayjs.extend(duration);
dayjs.extend(utc);

interface JsonError {
    id: number;
    employee_title: string;
    first_column: string;
    second_column: string;
    issue_description: string;
    recovery_title: string;
    device_type: string;
    issue_type: string;
    solving_time: number; // В JSON именно это имя
}

// Приведение типов для данных из JSON
const errors_data = errors_data_raw as JsonError[];

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
    reason: string;
    reason_recovery: string;
    issue_description: string;
}

const numbers_kubot: number[] = [
    ...Array.from({ length: 341 - 163 }, (_, i) => i + 163),
    ...Array.from({ length: 1476 - 1301 }, (_, i) => i + 1301),
];

const numbers_kiva: number[] = [
    ...Array.from({ length: 1299 - 698 + 1 }, (_, i) => i + 698),
    ...Array.from({ length: 2228 - 1501 + 1 }, (_, i) => i + 1501),
];

const getDeviceType = (device_number: string) => {
    if (numbers_kubot.includes(Number(device_number))) {
        return "A42T-E2 hook";
    }

    if (numbers_kiva.includes(Number(device_number))) {
        return "K50H";
    }

    return "Unknown";
}

let errors: string[] = []

const parseLine = (line: string, lineNumber: number, employee: string) => {
    const parts = line.split('.');

    if (parts.length < 3) {
        console.warn(`Line ${line}: Invalid format (expected at least 3 parts)`);
        errors.push(`${employee} - ${line}`);
        return null
    }

    const error_template = errors_data.find(template => template.first_column.includes(parts[0]));

    const device_number = parts[1]
    const reason = parts[2]
    const reason_recovery = parts[3]

    const today = getWorkDate(dayjs().toDate());
    const start_time = dayjs(`${dayjs(today).format("YYYY-MM-DD")} ${parts[4].trim()}`, 'YYYY-MM-DD HH:mm').toDate();

    const obj = {
        employee: employee,
        first_column: error_template?.first_column || "Unknown",
        second_column: error_template?.second_column || "Unknown",
        error_robot: device_number,
        error_start_time: start_time,
        error_end_time: dayjs(start_time).add(error_template?.solving_time || 0, 'minute').toDate(),
        recovery_title: reason_recovery,
        solving_time: error_template?.solving_time || 0,
        device_type: getDeviceType(device_number),
        issue_type: error_template?.issue_type || "Unknown",
        reason: reason,
        reason_recovery: reason_recovery,
        issue_description: error_template?.issue_description || "Unknown",
    }

    return obj;
};

const employee_list = [
    "Kolomiiets Dmytro",
    "Oleksandr Savchuk",
    "Idris mekaoui",
    "Nikita Belinskyi",
    "Vitalii Lepekha",
    "Stepan Zapotichnyi",
    "SALMI ABDERAOUF",
    "Ilkin Azimzade",
    "Misha Meteshko",
    "Rostyslav Mykhavko",
    "Artem Prykhodko",
]

const Page = () => {
    const [value, setValue] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [parsed, setParsed] = useState<ILocalIssue[]>([]);

    const parse = async () => {
        try {
            errors = []
            setParsed([]);

            const byLines = value.split('\n').filter((item: string) => item.trim().length > 0);
            const results: ILocalIssue[] = [];

            let employee = "";

            byLines.forEach((line: string, index: number) => {

                if (employee_list.includes(line)) {
                    employee = line;
                    return;
                }

                const parsed = parseLine(line, index + 1, employee);

                if (parsed) {
                    results.push(parsed);
                }
            });

            setParsed(results);
            //return results;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };


    const copyToClipboard = () => {
        const headers = [
            "Date", "Warehouse", "Robot Type", "Robot Number", "Type",
            "Error", "Error Deeply", "", "Employee Text", "Recovery options",
            "Employee", "Start Time", "End Time", "Time Gap (min)", "Employee", "Status"
        ];


        const rowsP3 = parsed.map(error => {
            const diffMinutes = dayjs(error.error_end_time).diff(dayjs(error.error_start_time), 'minute');
            return [
                dayjs().format('MM/DD/YYYY'),
                error.device_type,
                "",
                error.error_robot,
                error.issue_type,
                error.first_column,
                error.second_column,
                error.reason,
                error.reason_recovery,
                "已处理Processed",
                `@${error.employee}`,
                dayjs(error.error_start_time).format("HH:mm"),
                dayjs(error.error_end_time).format("HH:mm"),
                dayjs().format(`00:${diffMinutes}`),
            ];
        });

        const tsvContentP3 = [...rowsP3.map(row => row.join('\t'))].join('\n');

        navigator.clipboard.writeText(tsvContentP3).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="container mx-auto p-6 max-w-[1600px]">
            <div className="flex flex-col gap-4 mb-8">
                <div>
                    <Textarea
                        className="max-h-[200px] font-mono"
                        placeholder="Dmytro Kolomiiets&#10;Speed error. 124. 14:20"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <Button onClick={parse}><FileText className="w-4 h-4 mr-2"/> Parse Data</Button>
                    <Button onClick={() => {
                        setValue("");
                        setParsed([]);
                    }} variant="outline">Clear</Button>
                </div>
            </div>

            {errors.length > 0 && (
                <div className="mb-8 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                    <h3 className="text-destructive font-bold mb-2">Unsuccessful Parse ({errors.length})</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {errors.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}

            {parsed.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Results: {parsed.length}</h2>
                        <ButtonGroup>
                            <Button onClick={() => copyToClipboard()} variant={copied ? "secondary" : "default"}>
                                {copied ? <Check className="w-4 h-4 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>}
                                {copied ? "Copied!" : "Copy"}
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
                                    <TableHead>Gap</TableHead>
                                    <TableHead>Operator</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsed.map((error, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-bold">
                                            <div className={`flex items-center gap-2`}>
                                                <div>
                                                    {Number(error.error_robot) > 150
                                                        ? <Image src={`/img/K50H_red.svg`} alt={`robot_img`} width={30}
                                                                 height={30}/>
                                                        : <Image src={`/img/A42T_red.svg`} alt={`robot_img`} width={30}
                                                                 height={30}/>
                                                    }
                                                </div>
                                                <article>{error.error_robot} - {error.device_type}</article>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{error.first_column}</div>
                                            <div className="text-xs text-muted-foreground">{error.second_column}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{error.reason}</div>
                                            <div className="text-xs text-muted-foreground">{error.reason_recovery}</div>
                                        </TableCell>
                                        <TableCell>{dayjs(error.error_start_time).format("HH:mm")}</TableCell>
                                        <TableCell>{dayjs(error.error_end_time).format("HH:mm")}</TableCell>
                                        <TableCell className="font-bold">
                                            {dayjs(error.error_end_time).diff(error.error_start_time, 'minute')}
                                        </TableCell>
                                        <TableCell>{error.employee}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;