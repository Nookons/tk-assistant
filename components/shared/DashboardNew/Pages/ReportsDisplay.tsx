import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShiftReportGLPC from "@/components/shared/DashboardNew/DashboardComponents/Reports/ShiftReportGLPC";
import MonthReportGLPC from "@/components/shared/DashboardNew/DashboardComponents/Reports/MonthReportGLPC";

const STORAGE_KEY = 'report_sub_tab';
const DEFAULT_TAB = 'glpc_shift';

const ReportsDisplay = () => {
    const [activeTab, setActiveTab] = useState<string>(() => {
        if (typeof window === 'undefined') return DEFAULT_TAB;
        return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_TAB;
    });

    const onTabChange = (value: string) => {
        localStorage.setItem(STORAGE_KEY, value);
        setActiveTab(value);
    };

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList>
                <TabsTrigger value="glpc_shift">Shift Report</TabsTrigger>
                <TabsTrigger value="analytics">Month Report</TabsTrigger>
            </TabsList>
            <TabsContent value="glpc_shift">
                <ShiftReportGLPC />
            </TabsContent>
            <TabsContent value="analytics">
                <MonthReportGLPC />
            </TabsContent>
        </Tabs>
    );
};

export default ReportsDisplay;