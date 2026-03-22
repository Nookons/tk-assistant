import React from 'react';
import StockHistoryList from "@/components/shared/DashboardNew/DashboardComponents/Stock/StockHistoryList";
import PagesHeader from "@/components/shared/PagesHeader";

const Page = () => {
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