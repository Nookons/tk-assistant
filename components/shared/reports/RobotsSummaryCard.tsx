import React from 'react';
import {Card, CardContent, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";

interface IRobotsSummary {
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

const RobotsSummaryCard = ({title, summary_data} : {title: string, summary_data: IRobotsSummary}) => {
    return (
        <Card>
            <CardTitle className="px-4">{title}</CardTitle>
            <CardContent className="space-y-3">

                <Label>Total Robots: {summary_data.total_robots}</Label>

                {/* Универсальный стиль для всех строк */}
                <div className="grid grid-cols-[1fr_120px_80px] items-center text-center gap-4">
                    <Label className="text-neutral-500">Working Hours:</Label>
                    <Label>{summary_data.working_hours.toLocaleString()} min</Label>
                    <Badge>{summary_data.working_hours_percentage.toFixed(2)}%</Badge>
                </div>

                <div className="grid grid-cols-[1fr_120px_80px] items-center text-center gap-4">
                    <Label className="text-neutral-500">Charge Hours:</Label>
                    <Label>{summary_data.charge_hours.toLocaleString()} min</Label>
                    <Badge>{summary_data.charge_hours_percentage.toFixed(2)}%</Badge>
                </div>

                <div className="grid grid-cols-[1fr_120px_80px] items-center text-center gap-4">
                    <Label className="text-neutral-500">Offline Hours:</Label>
                    <Label>{summary_data.total_offline.toLocaleString()} min</Label>
                    <Badge>{summary_data.total_offline_percentage.toFixed(2)}%</Badge>
                </div>

                <div className="grid grid-cols-[1fr_120px_80px] items-center text-center gap-4">
                    <Label className="text-neutral-500">Abnormal Hours:</Label>
                    <Label>{summary_data.total_abnormal.toLocaleString()} min</Label>
                    <Badge>{summary_data.total_abnormal_percentage.toFixed(2)}%</Badge>
                </div>

                <div className="grid grid-cols-[1fr_120px_80px] items-center text-center gap-4">
                    <Label className="text-neutral-500">Idle Hours:</Label>
                    <Label>{summary_data.total_idle.toLocaleString()} min</Label>
                    <Badge>{summary_data.total_idle_percentage.toFixed(2)}%</Badge>
                </div>

            </CardContent>
        </Card>
    );
};

export default RobotsSummaryCard;
