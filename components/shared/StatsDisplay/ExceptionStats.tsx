import React, {useMemo} from 'react';
import {IRobotException} from "@/types/Exception/Exception";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {AlertTriangle, Clock, CheckCircle, TrendingUp} from "lucide-react";
import dayjs from "dayjs";

interface ExceptionStatsProps {
    data: IRobotException[];
}

export const ExceptionStats = ({data}: ExceptionStatsProps) => {
    const stats = useMemo(() => {
        const totalExceptions = data.length;
        const avgDuration = data.reduce((acc, curr) => {
            const diff = dayjs(curr.error_end_time).diff(curr.error_start_time, 'minute');
            return acc + diff;
        }, 0) / (totalExceptions || 1);

        const criticalExceptions = data.filter(exc => {
            const diff = dayjs(exc.error_end_time).diff(exc.error_start_time, 'minute');
            return diff > 60;
        }).length;

        const uniqueRobots = new Set(data.map(exc => exc.error_robot)).size;

        return {
            total: totalExceptions,
            avgDuration: Math.round(avgDuration),
            critical: criticalExceptions,
            uniqueRobots
        };
    }, [data]);

    return (
        <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-3 mb-6">
            <div className="text-sm font-medium flex border p-2 rounded-md items-center gap-2 justify-between">
                <div className="text-base flex items-center gap-2 font-bold">
                    <p className={`text-xs text-muted-foreground`}>Total Exceptions</p>
                    <p>{stats.total}</p>
                </div>
                <AlertTriangle className="h-4 w-4 text-muted-foreground"/>
            </div>

            <div className="text-sm font-medium flex border p-2 rounded-md items-center gap-2 justify-between">
                <div className="text-base flex items-center gap-2 font-bold">
                    <p className={`text-xs text-muted-foreground`}>Avg Duration</p>
                    <p>{stats.avgDuration} min</p>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground"/>
            </div>

            <div className="text-sm font-medium flex border p-2 rounded-md items-center gap-2 justify-between">
                <div className="text-base flex items-center gap-2 font-bold">
                    <p className={`text-xs text-muted-foreground`}>Affected Robots</p>
                    <p>{stats.uniqueRobots}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-muted-foreground"/>
            </div>
        </div>
    );
};