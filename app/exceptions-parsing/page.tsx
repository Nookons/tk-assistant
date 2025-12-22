'use client'
import React, {useEffect, useState} from 'react';
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Copy, Check, FileText} from "lucide-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import {toast} from "sonner";
import errors_data_raw from '../../utils/ErrorsPatterns/ErrorsPatterns.json';
import Image from "next/image";
import TemplateInfo from "@/components/shared/ErrorParse/TemplateInfo";
import { ButtonGroup } from "@/components/ui/button-group"

dayjs.extend(duration);
dayjs.extend(utc);

const employees_data = [
    "Dmytro Kolomiiets", "Heorhi Labets", "Vasyl  Bondarenko",
    "Ivan Bulii", "邓广全", "Mykyta Kyrylov",
    "Tugsbayar Batsukh",
    "Andrii Kyrychok",
    "Yevgenii Krysiuk",
    "Oleksandr Sofyna",
    "Vitalii Lepekha",
    "Kryvenko Danylo",
    "Rostyslav Mykhavko",
    "Iliya Kudii",
    "Ilkin Azimzade",
    "Eduard Maliuk",
    "Stepan Zapotichyi",
    "SALMI ABDERAOUF",
    "RAIS AMINE",
    "Amdjed Dilmi",
    "Oleksii Ilin",
    "Petro Diakunchak",
    "Danylo Yakubchik",
    "Yevhen Horetskyi",
    "Nazar",
];

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

interface ILocalIssue {
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
}

const Page = () => {
    const [value, setValue] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [wrong_parse, setWrong_parse] = useState<string[]>([]);
    const [parsed, setParsed] = useState<ILocalIssue[]>([]);

    const parse = () => {
        // Очищаем старые данные перед новым парсингом
        setWrong_parse([]);
        setParsed([]);

        const lines = value.split('\n').filter(item => item.trim().length > 0);
        let current_employee = "";
        const temp_parsed: ILocalIssue[] = [];
        const temp_wrong: string[] = [];

        lines.forEach(line => {
            const trimmedLine = line.trim();

            if (employees_data.includes(trimmedLine)) {
                current_employee = trimmedLine;
                return;
            }

            const parts = trimmedLine.split(".");

            const error_string = parts[0]
            const error_robot = parts[1]
            const error_time = parts[2]

            if (error_string === "Translate") return;

            const error_pattern = errors_data.find(error =>
                error.employee_title.toLowerCase().includes(error_string.toLowerCase())
            );

            if (!error_pattern) {
                toast.error(`Error not found: ${error_string}`);
                temp_wrong.push(`${error_time} | ${current_employee || "No Employee"} - ${error_string} - ${error_robot}`);
                return;
            }

            // Формируем дату: сегодняшнее число + время из строки
            const startTime = dayjs(`${dayjs().format("YYYY-MM-DD")} ${error_time}`);


            temp_parsed.push({
                employee: current_employee || "Unknown",
                first_column: error_pattern.first_column,
                second_column: error_pattern.second_column,
                error_robot: error_robot,
                error_start_time: startTime.toDate(),
                // Используем правильное поле solving_time из JSON
                error_end_time: startTime.add(error_pattern.solving_time, 'minute').toDate(),
                recovery_title: error_pattern.recovery_title,
                solving_time: error_pattern.solving_time,
                device_type: error_pattern.device_type,
                issue_type: error_pattern.issue_type,
                issue_description: error_pattern.issue_description,
            });
        });

        setParsed(temp_parsed);
        setWrong_parse(temp_wrong);
    };

    const copyToClipboard = (type: 'GLPC' | "P3") => {
        const headers = [
            "Date", "Warehouse", "Robot Type", "Robot Number", "Type",
            "Error", "Error Deeply", "", "Employee Text", "Recovery options",
            "Employee", "Start Time", "End Time", "Time Gap (min)", "Employee", "Status"
        ];

        switch (type) {
            case "GLPC":
                const rows = parsed.map(error => {
                    const diffMinutes = dayjs(error.error_end_time).diff(dayjs(error.error_start_time), 'minute');
                    return [
                        dayjs().format('MM/DD/YYYY'),
                        "Inventory Warehouse",
                        Number(error.error_robot) < 150 ? "A42T-E1 Clamp" : "K50H",
                        error.error_robot,
                        error.issue_type,
                        error.first_column,
                        error.second_column,
                        "",
                        error.first_column,
                        error.recovery_title,
                        error.employee,
                        dayjs(error.error_start_time).format("HH:mm"),
                        dayjs(error.error_end_time).format("HH:mm"),
                        diffMinutes,
                        error.employee,
                        "已处理Processed"
                    ];
                });

                const tsvContent = [...rows.map(row => row.join('\t'))].join('\n');

                navigator.clipboard.writeText(tsvContent).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                });
                break;
            case "P3":
                const rowsP3 = parsed.map(error => {
                    const diffMinutes = dayjs(error.error_end_time).diff(dayjs(error.error_start_time), 'minute');
                    return [
                        dayjs().format('MM/DD/YYYY'),
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
                break;
        }

    };

    useEffect(() => {
        console.log(wrong_parse);
    }, [wrong_parse]);

    return (
        <div className="container mx-auto p-6 max-w-[1600px]">
            <div className="flex flex-col gap-4 mb-8">
                <div>
                    <div className={`my-2`}>
                        <TemplateInfo />
                    </div>
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
                        setWrong_parse([]);
                    }} variant="outline">Clear</Button>
                </div>
            </div>

            {wrong_parse.length > 0 && (
                <div className="mb-8 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                    <h3 className="text-destructive font-bold mb-2">Unsuccessful Parse ({wrong_parse.length})</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {wrong_parse.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}

            {parsed.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Results: {parsed.length}</h2>
                        <ButtonGroup>
                            <Button onClick={() => copyToClipboard("GLPC")} variant={copied ? "secondary" : "default"}>
                                {copied ? <Check className="w-4 h-4 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>}
                                {copied ? "Copied!" : "Copy GLPC"}
                            </Button>
                            <Button onClick={() => copyToClipboard("P3")} variant={copied ? "secondary" : "default"}>
                                {copied ? <Check className="w-4 h-4 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>}
                                {copied ? "Copied!" : "Copy P3"}
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
                                                <article>{error.error_robot} - {Number(error.error_robot) < 150 ? "A42" : "K50"}</article>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{error.first_column}</div>
                                            <div className="text-xs text-muted-foreground">{error.second_column}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{error.issue_description}</div>
                                            <div className="text-xs text-muted-foreground">{error.recovery_title}</div>
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