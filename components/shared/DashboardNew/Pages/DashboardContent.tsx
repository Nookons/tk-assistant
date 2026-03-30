import {Button} from "@/components/ui/button";
import {
    ChevronRight,
} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import StockHistory from "@/components/shared/DashboardNew/DashboardComponents/StockHistory";
import React from "react";
import RobotsHistory from "@/components/shared/DashboardNew/DashboardComponents/RobotsList";
import {useUserStore} from "@/store/user";
import Link from "next/link";
import RepairStats from "@/components/shared/DashboardNew/DashboardComponents/Dashboard/RepairStats";
import ExceptionsStats from "@/components/shared/DashboardNew/DashboardComponents/Dashboard/ExceptionsStats";
import UsedPartsStats from "@/components/shared/DashboardNew/DashboardComponents/Dashboard/UsedPartsStats";
import AddedPartsStats from "@/components/shared/DashboardNew/DashboardComponents/Dashboard/AddedPartsStats";
import ExceptionChart from "@/components/shared/DashboardNew/DashboardComponents/Dashboard/ExceptionChart";

interface Props {
    onSelect: (id: string) => void;
}

function DashboardContent({onSelect}: Props) {
    const user = useUserStore(state => state.currentUser)

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard for {user?.user_name}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Welcome! Have a good day.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <RepairStats />
                <ExceptionsStats />
                <UsedPartsStats />
                <AddedPartsStats />
            </div>

            <div className={`border`}>
                <ExceptionChart />
            </div>

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
                        <RobotsHistory />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className="text-base">Stock</CardTitle>
                            <CardDescription>Latest additions to history</CardDescription>
                        </div>
                        <Link href={`/stock/stock-history`}>
                            <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                More <ChevronRight size={13}/>
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <StockHistory/>
                    </CardContent>
                </Card>

                {/*<Card className="lg:col-span-3 hidden md:block">
                    <SummaryScreen/>
                </Card>*/}
            </div>
        </div>
    );
}

export default DashboardContent;