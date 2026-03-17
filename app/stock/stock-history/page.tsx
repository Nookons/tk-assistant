'use client'
import React from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {useUserStore} from "@/store/user";
import StockHistoryList from "@/components/shared/DashboardNew/DashboardComponents/Stock/StockHistoryList";
import PagesHeader from "@/components/shared/PagesHeader";

const Page = () => {
    const user = useUserStore(state => state.currentUser)

    return (
        <div className="min-h-screen bg-background">
            <PagesHeader />

            <div>
                <StockHistoryList isShort={false} />
            </div>
        </div>
    );
};

export default Page;