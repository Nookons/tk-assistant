'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/shared/DashboardNew/Sidebar'
import DashboardHeader from '@/components/shared/DashboardNew/DashboardHeader'
import { PAGE_REGISTRY } from '@/components/shared/DashboardNew/navigationConfig'
import { Skeleton } from '@/components/ui/skeleton'

const FULL_WIDTH_PAGES = ['settings', 'inventory']

function PageSkeleton({ fullWidth }: { fullWidth: boolean }) {
    return (
        <div className={fullWidth ? 'w-full' : 'p-6'}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-9 w-28" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        </div>
    )
}

export default function Dashboard() {
    const [activeNav, setActiveNav] = useState<string | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Читаем localStorage только на клиенте
    useEffect(() => {
        const saved = localStorage.getItem('activeTab') ?? 'dashboard'
        setActiveNav(saved)
    }, [])

    const isReady = activeNav !== null
    const CurrentPage = isReady ? PAGE_REGISTRY[activeNav] : null
    const isFullWidth = isReady && FULL_WIDTH_PAGES.includes(activeNav)

    const handleTabChange = (id: string) => {
        localStorage.setItem('activeTab', id)
        setActiveNav(id)
        setSidebarOpen(false)
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background font-sans">

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                activeItem={activeNav ?? 'dashboard'}
                onSelect={handleTabChange}
                open={sidebarOpen}
            />

            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <DashboardHeader
                    onMenuToggle={() => setSidebarOpen(v => !v)}
                    sidebarOpen={sidebarOpen}
                    onSelect={handleTabChange}
                />

                <main className="flex-1 overflow-y-auto">
                    {!isReady && <PageSkeleton fullWidth={false} />}

                    {isReady && CurrentPage && (
                        <div className={isFullWidth ? undefined : 'p-6'}>
                            <CurrentPage onSelect={handleTabChange} />
                        </div>
                    )}
                </main>
            </div>

        </div>
    )
}