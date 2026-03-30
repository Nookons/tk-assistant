'use client'

import { useEffect, useState } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/shared/DashboardNew/Sidebar'
import DashboardHeader from '@/components/shared/DashboardNew/DashboardHeader'
import { PAGE_REGISTRY } from '@/components/shared/DashboardNew/navigationConfig'
import { Skeleton } from '@/components/ui/skeleton'

const FULL_WIDTH_PAGES = ['settings', 'inventory']

function PageSkeleton() {
    return (
        <div className="p-6 space-y-4">
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
    )
}

export default function Dashboard() {
    const [activeNav, setActiveNav] = useState<string | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true
        const saved = localStorage.getItem('sidebarOpen')
        return saved === null ? true : saved === 'true'
    })

    const handleSidebarChange = (open: boolean) => {
        setSidebarOpen(open)
        localStorage.setItem('sidebarOpen', String(open))
    }

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
    }

    return (
        <SidebarProvider
            open={sidebarOpen}
            onOpenChange={handleSidebarChange}
        >
            <div className="flex h-screen w-full overflow-hidden bg-background">
                <AppSidebar
                    activeItem={activeNav ?? 'dashboard'}
                    onSelect={handleTabChange}
                />

                <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                    <DashboardHeader
                        onSelect={handleTabChange}
                        trigger={<SidebarTrigger />}
                    />

                    <main className="flex-1 overflow-y-auto">
                        {!isReady && <PageSkeleton />}

                        {isReady && CurrentPage && (
                            <div className={isFullWidth ? undefined : 'p-6'}>
                                <CurrentPage onSelect={handleTabChange} />
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </SidebarProvider>
    )
}