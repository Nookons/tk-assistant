import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { Check, Copy } from "lucide-react";

import { ILocalIssue } from "@/types/Exception/ExceptionParse";
import { IRobot } from "@/types/robot/robot";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { WarehouseType } from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/FormatForClipboard";

interface Props {
    issues: ILocalIssue[];
    p3Robots: IRobot[];
    glpcRobots: IRobot[];
    isSaving: boolean;
    isCopied: boolean;
    onCopy: (type: WarehouseType) => void;
}

const getRobotType = (issue: ILocalIssue, p3Robots: IRobot[], glpcRobots: IRobot[]) => {
    const pool = issue.warehouse === "P3" ? p3Robots : glpcRobots;
    return pool.find((r) => Number(r.robot_number) === Number(issue.error_robot))?.robot_type ?? "Unknown";
};

export const ErrorParseTable: React.FC<Props> = ({
                                                     issues, p3Robots, glpcRobots, isSaving, isCopied, onCopy,
                                                 }) => (
    <div className="space-y-4">
        {/* Header row */}
        <div className="flex justify-between items-center">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                    Results: {issues.length} issue{issues.length > 1 ? "s" : ""}
                </h2>
                {isSaving && (
                    <p className="text-sm text-muted-foreground">Saving to server…</p>
                )}
            </div>

            <ButtonGroup>
                {(["GLPC", "P3"] as WarehouseType[]).map((type) => (
                    <Button
                        key={type}
                        onClick={() => onCopy(type)}
                        variant={isCopied ? "secondary" : "default"}
                        disabled={isSaving}
                    >
                        {isCopied
                            ? <Check className="w-4 h-4 mr-2" />
                            : <Copy className="w-4 h-4 mr-2" />
                        }
                        {isCopied ? "Copied!" : `Copy ${type}`}
                    </Button>
                ))}
            </ButtonGroup>
        </div>

        {/* Table */}
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
                    {issues.map((issue, i) => {
                        const robotType = getRobotType(issue, p3Robots, glpcRobots);
                        const timeDiff  = dayjs(issue.error_end_time).diff(issue.error_start_time, "minute");

                        return (
                            <TableRow key={i}>
                                <TableCell>
                                    <p className="line-clamp-1 text-xs">{issue.warehouse}</p>
                                </TableCell>

                                <TableCell className="font-bold">
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={robotType === "K50H" ? "/img/K50H_red.svg" : "/img/A42T_red.svg"}
                                            alt="robot"
                                            width={30}
                                            height={30}
                                        />
                                        <span>{issue.error_robot} - {issue.device_type}</span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <p className="line-clamp-1 text-xs">{issue.first_column}</p>
                                    <p className="line-clamp-1 text-xs">{issue.second_column}</p>
                                </TableCell>

                                <TableCell>
                                    <p className="line-clamp-1 text-xs">{issue.issue_description}</p>
                                    <p className="line-clamp-1 text-xs">{issue.recovery_title}</p>
                                </TableCell>

                                <TableCell>{dayjs(issue.error_start_time).format("HH:mm")}</TableCell>
                                <TableCell>{dayjs(issue.error_end_time).format("HH:mm")}</TableCell>
                                <TableCell className="font-bold">{timeDiff}</TableCell>
                                <TableCell>{issue.employee}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    </div>
);