'use client'
import React from 'react';
import {IChangeRecord} from "@/types/Parts/ChangeRecord";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Wrench, Hash, Bot, User as UserIcon} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);

const ChangedPartsList = ({data}: { data: IChangeRecord[] }) => {
    const parsePartNumbers = (parts: string) => {
        return parts
            .split(/[,;\n]+/)
            .map(part => part.trim())
            .filter(part => part.length > 0);
    };

    const getRobotTypeColor = (type: string) => {
        const normalizedType = type?.toLowerCase() || '';
        if (normalizedType.includes('k50') || normalizedType.includes('high')) {
            return 'bg-purple-100 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300';
        }
        return 'bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300';
    };

    return (
        <div className={`overflow-hidden`}>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold">
                            <div className="flex items-center gap-1.5">
                                <Bot className="w-4 h-4"/>
                                Robot
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold">
                            <div className="flex items-center gap-1.5">
                                <Wrench className="w-4 h-4"/>
                                Parts Changed
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold">
                            <div className="flex items-center gap-1.5">
                                <UserIcon className="w-4 h-4"/>
                                Employee
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((record) => {
                        const partsList = parsePartNumbers(record.parts_numbers);
                        const isHighRobot = record.robot.robot_type !== "K50H"

                        return (
                            <TableRow
                                key={record.id}
                                className="hover:bg-muted/30 transition-colors group"
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div
                                                className={`p-2 rounded-lg border ${getRobotTypeColor(record.robot?.robot_type || '')}`}>
                                                <Image
                                                    src={isHighRobot ? `/img/K50H_red.svg` : `/img/A42T_red.svg`}
                                                    alt="robot"
                                                    width={24}
                                                    height={24}
                                                    className="opacity-90"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-base">
                                                    {record.robot?.robot_number || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            {partsList.slice(0, 3).map((part, idx) => {
                                                const part_parse = JSON.parse(part)

                                                return (
                                                    <Badge
                                                        key={idx}
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        <Hash className="w-3 h-3 mr-1"/>
                                                        {part_parse}
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                        {partsList.length > 3 && (
                                            <details className="text-xs text-muted-foreground cursor-pointer">
                                                <summary
                                                    className="hover:text-foreground transition-colors select-none">
                                                    Show all {partsList.length} parts
                                                </summary>
                                                <div className="mt-2 pl-4 border-l-2 border-muted space-y-1">
                                                    {partsList.map((part, idx) => (
                                                        <div key={idx} className="font-mono">
                                                            {idx + 1}. {part}
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="space-y-0.5">
                                            <div className="font-semibold text-sm">
                                                {record.user?.user_name || 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center backdrop-blur-sm">
                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                        <Wrench className="w-8 h-8 text-muted-foreground/50"/>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                        No parts changed yet
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                        Part replacement records will appear here
                    </p>
                </div>
            )}
        </div>
    );
};

export default ChangedPartsList;