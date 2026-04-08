import React, {useEffect, useState} from 'react';
import {toast} from "sonner";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {TrendingDown, TrendingUp, Minus, WrenchIcon, PackagePlus} from "lucide-react";
import {StockService} from "@/services/stockService";
import {useSessionStore} from "@/store/session";

dayjs.extend(isBetween);

interface RepairStatsData {
    currentMonth: number;
    prevMonth: number;
}

const AddedPartsStats = () => {
    const session = useSessionStore(state => state.currentSession)
    const [stats, setStats] = useState<RepairStatsData | null>(null);
    const [loading, setLoading] = useState(true);

    const getHistoryData = async () => {
        try {
            const response = await StockService.getStockHistory(session?.warehouse_sessions ?? "");

            if (response) {
                const used_data = response.filter(part => part.quantity > 0)

                const currentMonthStart = dayjs().startOf('month');
                const currentMonthEnd = dayjs().endOf('month');
                const prevMonthStart = dayjs().subtract(1, 'month').startOf('month');
                const prevMonthEnd = dayjs().subtract(1, 'month').endOf('month');

                const currentMonth = used_data
                    .filter(r => dayjs(r.created_at).isBetween(currentMonthStart, currentMonthEnd, null, '[]'))
                    .reduce((sum, r) => sum + r.quantity, 0);

                const prevMonth = used_data
                    .filter(r => dayjs(r.created_at).isBetween(prevMonthStart, prevMonthEnd, null, '[]'))
                    .reduce((sum, r) => sum + r.quantity, 0);

                setStats({currentMonth, prevMonth});
            }
        } catch (error) {
            console.error(error);
            error && toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getHistoryData();
    }, []);

    const diff = stats ? stats.currentMonth - stats.prevMonth : 0;
    const diffPercent = stats?.prevMonth
        ? Math.round(((stats.currentMonth - stats.prevMonth) / stats.prevMonth) * 100)
        : null;

    const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
    const trendColor = diff < 0
        ? "text-destructive"
        : diff < 0
            ? "text-emerald-500"
            : "text-muted-foreground";

    const currentMonthLabel = dayjs().format('MMMM');
    const prevMonthLabel = dayjs().subtract(1, 'month').format('MMMM');

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Part events
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <PackagePlus  size={14} className="text-muted-foreground"/>
                    </div>
                </div>

                {loading ? (
                    <Skeleton className="h-9 w-16 mt-1"/>
                ) : (
                    <div className="flex items-end gap-3 mt-1">
                        <span className="text-3xl font-bold tracking-tight">
                            {Number(stats?.currentMonth).toLocaleString() ?? 0}
                        </span>
                        {diffPercent !== null && (
                            <div className={`flex items-center gap-1 mb-1 ${trendColor}`}>
                                <TrendIcon size={14}/>
                                <span className="text-xs font-medium">
                                    {diff > 0 ? "+" : ""}{diffPercent}%
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <p className="text-xs text-muted-foreground">
                    Spare parts was added in {currentMonthLabel}
                </p>
                <p>
                    {prevMonthLabel}: {Number(stats?.prevMonth).toLocaleString() ?? 0}
                </p>
            </CardHeader>
        </Card>
    );
};

export default AddedPartsStats;