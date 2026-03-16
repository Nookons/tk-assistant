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

const Page = () => {
    const user = useUserStore(state => state.currentUser)

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur px-6 py-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbSeparator className="rotate-180 text-foreground font-bold" />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link
                                    className="text-foreground font-bold"
                                    href={`/dashboard/${user?.auth_id ?? ''}`}
                                >
                                    Back
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div>
                <StockHistoryList isShort={false} />
            </div>
        </div>
    );
};

export default Page;