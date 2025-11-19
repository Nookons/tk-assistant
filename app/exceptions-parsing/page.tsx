'use client'
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Check, FileText } from "lucide-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";

dayjs.extend(duration);
dayjs.extend(utc);

const errors_data = [
    {
        id: 1,
        employee_title: "驱动组件异常 Driver component exception",
        first_column: "行走异常Unable to drive",
        second_column: "驱动组件异常 Driver component exception",
        recovery_title: "Check drive module and reboot",
        solving_time: 2
    },
    {
        id: 2,
        employee_title: "取放箱位置错误 Wrong pick and place box position",
        first_column: "取放货异常Abnormal pick-up and delivery",
        second_column: "取放箱位置错误Wrong pick and place box position",
        recovery_title: "Recalibrate pick/place position and retry",
        solving_time: 4
    },
    {
        id: 3,
        employee_title: "物料超高 Material super high",
        first_column: "掉箱子或掉落件Drop Box or items",
        second_column: "物料超高 Material super high",
        recovery_title: "Remove over-height material and reset task",
        solving_time: 2
    },
    {
        id: 4,
        employee_title: "地面码脏污 Ground code dirty",
        first_column: "行走异常Unable to drive",
        second_column: "地面码脏污 Ground code dirty",
        recovery_title: "Clean the ground code and retry",
        solving_time: 1
    },
    {
        id: 5,
        employee_title: "充电异常 Abnormal charging",
        first_column: "充电异常Abnormal charging",
        second_column: "无法定义异常Problom Cannot located",
        recovery_title: "Move out robot from charging station and retry",
        solving_time: 2
    },
    {
        id: 6,
        employee_title: "机器人安全装置触发Robot safety device triggered",
        first_column: "机器人安全装置触发Robot safety device triggered",
        second_column: "硬件损坏 Hardware damage",
        recovery_title: "Check safety device and reboot",
        solving_time: 4
    }
];

const employees_data = [
    "Dmytro Kolomiiets",
    "Roman",
    "Heorhi  Labets",
    "Vasyl  Bondarenko",
    "Andrii Kyrychok"
];

interface ILocalIssue {
    employee: string;
    first_column: string;
    second_column: string;
    error_robot: string;
    error_start_time: Date;
    error_end_time: any;
    recovery_title: string;
    solving_time: number;
}

const Page = () => {
    const [value, setValue] = useState<string>("");
    const [data, setData] = useState<ILocalIssue[]>([]);
    const [copied, setCopied] = useState(false);

    const parse = () => {
        const split = value.split('\n').filter(item => item.length > 0);
        let current_employee = "";
        const local_data: ILocalIssue[] = [];

        split.forEach(item => {
            if (employees_data.includes(item)) {
                current_employee = item;
                return;
            } else {
                const error_split = item.split(".");
                const error_title = error_split[0];
                const error_robot = error_split[1];
                const error_start_time = error_split[2];

                errors_data.forEach(error => {
                    if (error.employee_title === error_title) {
                        const obj = {
                            employee: current_employee,
                            first_column: error.first_column,
                            second_column: error.second_column,
                            error_robot: error_robot,
                            error_start_time: dayjs(`${dayjs().format("YYYY-MM-DD")} ${error_start_time}`).toDate(),
                            error_end_time: dayjs(`${dayjs().format("YYYY-MM-DD")} ${error_start_time}`).add(error.solving_time, "minute"),
                            recovery_title: error.recovery_title,
                            solving_time: error.solving_time,
                        };
                        local_data.push(obj);
                    }
                });
            }
        });

        setData(local_data as ILocalIssue[]);
    };

    const copyToClipboard = () => {
        const headers = [
            "Date", "Warehouse", "Robot Type", "Robot Number", "Type",
            "Error", "Error Deeply", "", "Employee Text", "Recovery options",
            "Employee", "Start Time", "End Time", "Time Gap", "Employee", "Status"
        ];

        const rows = data.map(error => [
            dayjs().format('DD/MM/YYYY'),
            "Inventory Warehouse",
            Number(error.error_robot) < 150 ? "A42T-E1 Clamp" : "K50H",
            error.error_robot,
            "设备Equipment",
            error.first_column,
            error.second_column,
            "",
            error.first_column,
            error.recovery_title,
            error.employee,
            dayjs(error.error_start_time).format("HH:mm"),
            dayjs(error.error_end_time).format("HH:mm"),
            dayjs.duration(dayjs(error.error_end_time).diff(dayjs(error.error_start_time))).format("HH:mm"),
            error.employee,
            "已处理Processed"
        ]);

        const tsvContent = [
            headers.join('\t'),
            ...rows.map(row => row.join('\t'))
        ].join('\n');

        navigator.clipboard.writeText(tsvContent).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const clearData = () => {
        setValue("");
        setData([]);
    };

    return (
        <div className="container mx-auto p-6 max-w-[1600px]">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Robot Error Parser</h1>
                <p className="text-gray-600">Parse robot error logs and export to spreadsheet</p>
            </div>

            <div className="rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Paste Error Log Data
                        </label>
                        <Textarea
                            className="min-h-[200px] max-h-[400px] font-mono text-sm"
                            placeholder="Paste your error log data here..."
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={parse} className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Parse Data
                        </Button>
                        <Button
                            onClick={clearData}
                            variant="outline"
                            disabled={!value && data.length === 0}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </div>

            {data.length > 0 && (
                <div className="rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-semibold">Parsed Results</h2>
                            <p className="text-sm text-gray-600">{data.length} error(s) found</p>
                        </div>
                        <Button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2"
                            variant={copied ? "default" : "default"}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy to Clipboard
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="overflow-x-auto border rounded-md">
                        <Table>
                            <TableCaption>Robot error log entries</TableCaption>
                            <TableHeader>
                                <TableRow className="">
                                    <TableHead className="font-semibold">Date</TableHead>
                                    <TableHead className="font-semibold">Warehouse</TableHead>
                                    <TableHead className="font-semibold">Robot Type</TableHead>
                                    <TableHead className="font-semibold">Robot Number</TableHead>
                                    <TableHead className="font-semibold">Type</TableHead>
                                    <TableHead className="font-semibold">Error</TableHead>
                                    <TableHead className="font-semibold">Error Deeply</TableHead>
                                    <TableHead className="font-semibold"></TableHead>
                                    <TableHead className="font-semibold">Employee Text</TableHead>
                                    <TableHead className="font-semibold">Recovery Options</TableHead>
                                    <TableHead className="font-semibold">Employee</TableHead>
                                    <TableHead className="font-semibold">Start Time</TableHead>
                                    <TableHead className="font-semibold">End Time</TableHead>
                                    <TableHead className="font-semibold">Time Gap</TableHead>
                                    <TableHead className="font-semibold">Employee</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((error, index) => (
                                    <TableRow key={`robot-error-${index}`} className="">
                                        <TableCell className="whitespace-nowrap">
                                            {dayjs().format('DD/MM/YYYY')}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            Inventory Warehouse
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {Number(error.error_robot) < 150 ? "A42T-E1 Clamp" : "K50H"}
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {error.error_robot}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            设备Equipment
                                        </TableCell>
                                        <TableCell className="max-w-[350px]">
                                            {error.first_column}
                                        </TableCell>
                                        <TableCell className="max-w-[350px]">
                                            {error.second_column}
                                        </TableCell>
                                        <TableCell></TableCell>
                                        <TableCell className="max-w-[350px]">
                                            {error.first_column}
                                        </TableCell>
                                        <TableCell className="max-w-[400px]">
                                            {error.recovery_title}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {error.employee}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-mono">
                                            {dayjs(error.error_start_time).format("HH:mm")}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-mono">
                                            {dayjs(error.error_end_time).format("HH:mm")}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-mono">
                                            {dayjs
                                                .duration(
                                                    dayjs(error.error_end_time).diff(dayjs(error.error_start_time))
                                                )
                                                .format("HH:mm")}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {error.employee}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                已处理Processed
                                            </span>
                                        </TableCell>
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