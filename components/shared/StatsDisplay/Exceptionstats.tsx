import React, { useMemo } from 'react';
import { IRobotException } from "@/types/Exception/Exception";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle, TrendingUp } from "lucide-react";
import dayjs from "dayjs";

interface ExceptionStatsProps {
    data: IRobotException[];
}

export const ExceptionStats = ({ data }: ExceptionStatsProps) => {
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
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 mb-6">
            <Card className={`p-4`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">
                        Total Exceptions
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Across all robots
                    </p>
                </CardContent>
            </Card>

            <Card className={`p-4`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Avg Duration
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.avgDuration} min</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Average downtime
                    </p>
                </CardContent>
            </Card>

            <Card className={`p-4`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Affected Robots
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.uniqueRobots}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Unique robots
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};