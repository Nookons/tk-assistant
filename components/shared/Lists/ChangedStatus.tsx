'use client'
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    ArrowRight,
    Clock,
    Activity,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {IStatusHistory} from "@/components/shared/dashboard/ShiftStats/MonthStats";

dayjs.extend(relativeTime);

interface ChangedStatusProps {
    data: IStatusHistory[];
    groupByRobot?: boolean;
}

const ChangedStatus = ({ data, groupByRobot = false }: ChangedStatusProps) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline";
        }> = {
            'Online': {
                label: '在线 | Online',
                color: 'text-green-700 dark:text-green-300',
                bgColor: 'bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-800',
                icon: <CheckCircle2 className="w-4 h-4" />,
                variant: 'default'
            },
            'Offline': {
                label: '离线 | Offline',
                color: 'text-red-700 dark:text-red-300',
                bgColor: 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800',
                icon: <AlertCircle className="w-4 h-4" />,
                variant: 'destructive'
            }
        };

        return configs[status.includes('Online') ? "Online" : "Offline"] || configs['Online'];
    };

    // Группировка по роботам если нужно
    const groupedData = groupByRobot
        ? data.reduce((acc, item) => {
            const robotId = item.robot_id;
            if (!acc[robotId]) {
                acc[robotId] = [];
            }
            acc[robotId].push(item);
            return acc;
        }, {} as Record<number, IStatusHistory[]>)
        : { all: data };

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                    No status changes recorded
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    Status change history will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedData).map(([robotId, items]) => (
                <div key={robotId} className="space-y-4">
                    {groupByRobot && robotId !== 'all' && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
                            <div className="font-semibold text-lg">
                                Robot #{items[0]?.robot_number}
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {items.length} {items.length === 1 ? 'change' : 'changes'}
                            </Badge>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="relative space-y-6">
                        {/* Timeline line */}
                        <div className="absolute left-[45px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/20 via-primary/10 to-primary/20" />

                        {items.map((item, index) => {
                            const oldConfig = getStatusConfig(item.old_status);
                            const newConfig = getStatusConfig(item.new_status);

                            const isFirst = index === 0;
                            const isLast = index === items.length - 1;

                            return (
                                <Card
                                    key={item.id}
                                    className="relative hover:shadow-md transition-shadow p-0"
                                >
                                    <div className="p-2">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center
                                                    border-4 border-background shadow-sm z-10 relative
                                                    ${newConfig.bgColor}
                                                `}>
                                                    {newConfig.icon}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-4 mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant={oldConfig.variant}
                                                                className={`${oldConfig.bgColor} ${oldConfig.color} border`}
                                                            >
                                                                {oldConfig.label}
                                                            </Badge>
                                                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                                            <Badge
                                                                variant={newConfig.variant}
                                                                className={`${newConfig.bgColor} ${newConfig.color} border`}
                                                            >
                                                                {newConfig.label}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8 border-2 border-primary/10">
                                                            <AvatarImage
                                                                src={item.user?.avatar_url}
                                                                alt={item.user?.user_name || 'User'}
                                                            />
                                                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xs">
                                                                {getInitials(item.user?.user_name || 'NA')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="text-sm">
                                                            <div className="font-medium">
                                                                {item.user?.user_name || 'Unknown'}
                                                            </div>
                                                            {item.user?.position && (
                                                                <div className="text-xs max-w-[150px] line-clamp-1 text-muted-foreground">
                                                                    {item.user.warehouse}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Robot number (if not grouped) */}
                                                {!groupByRobot && (
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span className="font-medium">
                                                                {dayjs(item.created_at).format("MMM D, YYYY")}
                                                            </span>
                                                            <span className="text-xs">•</span>
                                                            <span className="font-mono text-xs">
                                                                {dayjs(item.created_at).format("HH:mm:ss")}
                                                            </span>
                                                            <span className="text-xs">•</span>
                                                            <span className="text-xs">
                                                                {dayjs(item.created_at).fromNow()}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">Robot:</span>
                                                        <span className="text-sm font-bold font-mono">
                                                            #{item.robot_number}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChangedStatus;