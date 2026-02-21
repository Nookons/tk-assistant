'use client'
import {useEffect, useState} from "react";
import Sidebar from "@/components/shared/DashboardNew/Sidebar";
import DashboardHeader from "@/components/shared/DashboardNew/DashboardHeader";
import { PAGE_REGISTRY } from "@/components/shared/DashboardNew/Navigation_config";

export default function Dashboard() {
    const [activeNav, setActiveNav] = useState<string>(() => {
        if (typeof window === 'undefined') return 'dashboard';
        return localStorage.getItem('activeTab') ?? 'dashboard';
    });
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const CurrentPage = PAGE_REGISTRY[activeNav];

    const onTabChange = (id: string) => {
        localStorage.setItem('activeTab', id);
        setActiveNav(id);
        setSidebarOpen(false);
    };


    return (
        <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                activeItem={activeNav}
                onSelect={onTabChange}
                open={sidebarOpen}
            />

            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <DashboardHeader
                    onMenuToggle={() => setSidebarOpen((v) => !v)}
                    sidebarOpen={sidebarOpen}
                />

                <main className="flex-1 overflow-y-auto">
                    {CurrentPage && (
                        <>
                            {activeNav === 'settings' || activeNav === 'inventory'
                                ? <CurrentPage onSelect={(id: string) => onTabChange(id)} />
                                : <div className={`p-6`}><CurrentPage onSelect={(id: string) => onTabChange(id)} /></div>
                            }
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}