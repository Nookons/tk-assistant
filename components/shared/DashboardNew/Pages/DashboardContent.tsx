import {Button} from "@/components/ui/button";
import {
    ChevronRight,
    TrendingDown,
    TrendingUp,
    Package, PackagePlus, PackageMinus, Bot,
} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import StockHistory from "@/components/shared/DashboardNew/DashboardComponents/StockHistory";
import {useStockStore} from "@/store/stock";
import {useMemo} from "react";
import dayjs from "dayjs";
import React from "react";
import {useRobotsStore} from "@/store/robotsStore";
import RobotsHistory from "@/components/shared/DashboardNew/DashboardComponents/RobotsList";
import SummaryScreen from "@/components/shared/Stock/SummaryScreen";
import {useUserStore} from "@/store/user";
import {getUserWarehouse} from "@/utils/getUserWarehouse";


interface StatCard {
    title: string;
    value: string;
    change: string;
    positive: boolean;
    icon: React.ReactNode;
    color: string;
}


interface PlaceholderWidgetProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    hint?: string;
    minHeight?: string;
}


interface Props {
    onSelect: (id: string) => void;
}

function DashboardContent({onSelect}: Props) {
    const user = useUserStore(state => state.currentUser)
    const robots_history = useRobotsStore(state => state.robots)
    const stock_history = useStockStore(state => state.stock_history);

    const stockStats = useMemo(() => {
        if (!stock_history) return {income: 0, outcome: 0, net: 0, change: "0%", positive: true};

        const now = dayjs();
        const lastMonthDate = now.subtract(1, "month");

        const filterByMonth = (month: number, year: number) =>
            stock_history.filter(item => {
                const d = dayjs(item.created_at);
                return d.month() === month && d.year() === year;
            });

        const thisMonth = filterByMonth(now.month(), now.year());
        const lastMonth = filterByMonth(lastMonthDate.month(), lastMonthDate.year());

        // Считаем приход (>0) и расход (<0) отдельно
        const income = thisMonth.filter(i => i.value > 0).reduce((sum, i) => sum + i.value, 0);
        const outcome = thisMonth.filter(i => i.value < 0).reduce((sum, i) => sum + Math.abs(i.value), 0);
        const net = income - outcome;

        // % изменения net относительно прошлого месяца
        const lastNet = lastMonth.reduce((sum, i) => sum + i.value, 0);
        const diff = lastNet === 0 ? 100 : Math.round(((net - lastNet) / Math.abs(lastNet)) * 100);

        return {
            income,
            outcome,
            net,
            change: `${diff >= 0 ? "+" : ""}${diff}%`,
            positive: diff >= 0,
        };
    }, [stock_history]);

    const robots_stats = useMemo(() => {
        if (!robots_history) {
            return {income: 0, change: "+0%"};
        }

        const now = dayjs();
        const lastMonthDate = now.subtract(1, "month");

        const thisMonthRobots = new Set<string | number>();
        const lastMonthRobots = new Set<string | number>();

        for (const robot of robots_history) {
            const robotId = robot?.id;
            if (robotId == null) continue;

            const history = robot?.status_history ?? [];

            for (const status of history) {
                if (!status?.created_at) continue;

                const d = dayjs(status.created_at);

                if (d.month() === now.month() && d.year() === now.year()) {
                    thisMonthRobots.add(robotId);
                } else if (d.month() === lastMonthDate.month() && d.year() === lastMonthDate.year()) {
                    lastMonthRobots.add(robotId);
                }
            }
        }

        const thisCount = thisMonthRobots.size;
        const lastCount = lastMonthRobots.size;

        const diff =
            lastCount === 0
                ? (thisCount > 0 ? 100 : 0)
                : Math.round(((thisCount - lastCount) / Math.abs(lastCount)) * 100);

        return {
            income: thisCount,
            change: `${diff >= 0 ? "+" : ""}${diff}%`,
        };
    }, [robots_history]);

    // Итоговые карточки — static + динамическая карточка из stock
    const statCards: StatCard[] = useMemo(() => [
        {
            title: "Changed Statuses",
            value: String(robots_stats.income),
            change: robots_stats.change,
            positive: true,
            icon: <Bot size={20}/>,
            color: "text-emerald-500",
        },
        {
            title: "Stock In",
            value: String(stockStats.income),
            change: stockStats.change,
            positive: true,
            icon: <PackagePlus size={20}/>,
            color: "text-emerald-500",
        },
        {
            title: "Stock Out",
            value: String(stockStats.outcome),
            change: stockStats.change,
            positive: false,
            icon: <PackageMinus size={20}/>,
            color: "text-destructive",
        },
        {
            title: "Stock Net",         // итог: приход минус расход
            value: String(stockStats.net),
            change: stockStats.change,
            positive: stockStats.positive,
            icon: <Package size={20}/>,
            color: "text-violet-500",
        },
    ], [stockStats, robots_stats]);

    return (
        <div className="space-y-6">
            {/* Page title */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard for {getUserWarehouse(user?.warehouse || "")}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Welcome {user?.user_name}! Have a good day.</p>
                </div>
                {/*<div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Calendar size={14}/>
                        <span className="hidden sm:inline">Last 30 days</span>
                    </Button>
                    <Button size="sm">Export</Button>
                </div>*/}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div className={card.color}>{card.icon}</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className={`text-xs mt-1 flex items-center gap-1 ${card.positive ? "text-emerald-500" : "text-destructive"}`}>
                                {card.positive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                {card.change} vs last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Row 1: Revenue Chart + Stock History ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className="text-base">Robots list</CardTitle>
                            <CardDescription>Dynamics for the last 12 months</CardDescription>
                        </div>
                        <Button onClick={() => onSelect('robots')} variant="ghost" size="sm" className="gap-1 text-xs">
                            More <ChevronRight size={13}/>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <RobotsHistory warehouse={getUserWarehouse(user?.warehouse || "")} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className="text-base">Stock</CardTitle>
                            <CardDescription>Latest additions to history</CardDescription>
                        </div>
                        <Button onClick={() => onSelect('stock')} variant="ghost" size="sm" className="gap-1 text-xs">
                            More <ChevronRight size={13}/>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <StockHistory/>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 hidden md:block">
                    <SummaryScreen/>
                </Card>
            </div>
        </div>
    );
}

export default DashboardContent;