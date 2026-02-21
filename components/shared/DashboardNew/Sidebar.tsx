import {LayoutDashboard, LogOut, ChevronsLeft, ChevronsRight} from "lucide-react";
import {NAV_ITEMS} from "@/components/shared/DashboardNew/Navigation_config";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {useUserStore} from "@/store/user";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import React, {useState} from "react";
import {AuthService} from "@/services/authService";
import Image from "next/image";
import {useNavBadges} from "@/hooks/useNavBadges";


interface SidebarProps {
    activeItem: string;
    onSelect: (id: string) => void;
    open: boolean;
}


function Sidebar({activeItem, onSelect, open}: SidebarProps) {
    const user = useUserStore(state => state.currentUser);
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("isExpanded") === "true";
    });

    const badges = useNavBadges(); // ← добавь хук

    if (!user) return null;

    const handleLogOut = async () => {
        await AuthService.logout();
        window.location.href = "/login";
    };

    const toggleCollapsed = (value: boolean) => {
        localStorage.setItem("isExpanded", String(value));
        setCollapsed(value);
    };

    return (
        <TooltipProvider delayDuration={100}>
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 flex flex-col bg-card border-r border-border
                    transition-all duration-300 ease-in-out
                    ${open ? (collapsed ? "w-16" : "w-60") : "w-0 overflow-hidden"}
                    lg:relative lg:flex lg:overflow-visible
                    ${collapsed ? "lg:w-16" : "lg:w-60"}
                `}
            >
                {/* Logo */}
                <div className={`flex h-16 items-center border-b border-border shrink-0 px-3 ${collapsed ? "justify-center" : "gap-3 px-5 justify-between"}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        {!collapsed ? (
                            <span className="font-bold text-base tracking-tight whitespace-nowrap overflow-hidden">
                                TK Service
                            </span>
                        ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                                <span className="font-bold text-base tracking-tight whitespace-nowrap overflow-hidden">
                                    TK
                                </span>
                            </div>
                        )
                        }
                    </div>

                    {/* Collapse toggle — desktop only */}
                    {!collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex h-7 w-7 shrink-0 text-muted-foreground"
                            onClick={() => toggleCollapsed(true)}
                        >
                            <ChevronsLeft size={15}/>
                        </Button>
                    )}
                </div>

                {/* Expand button when collapsed */}
                {collapsed && (
                    <div className="hidden lg:flex justify-center pt-2 px-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => toggleCollapsed(false)}
                        >
                            <ChevronsRight size={15}/>
                        </Button>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {!collapsed && (
                        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Navigation
                        </p>
                    )}

                    {NAV_ITEMS.map((item) => {
                        const isActive = activeItem === item.id;
                        const badgeCount = badges[item.id] ?? item.badge;

                        const btn = (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={`
                                    w-full flex items-center rounded-md px-3 py-2.5 text-sm
                                    transition-colors duration-150 whitespace-nowrap
                                    ${collapsed ? "justify-center" : "justify-between gap-3"}
                                    ${isActive
                                    ? "bg-primary text-primary-foreground font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }
                                `}
                            >
                                <span className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                                    {item.icon}
                                    {!collapsed && item.label}
                                </span>

                                {!collapsed && badgeCount && (
                                    <Badge
                                        variant={isActive ? "secondary" : "default"}
                                        className="h-5 min-w-5 text-[10px] px-1.5"
                                    >
                                        {badgeCount > 99 ? "99+" : badgeCount}
                                    </Badge>
                                )}

                                {collapsed && badgeCount && (
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"/>
                                )}
                            </button>
                        );

                        // Wrap with tooltip only when collapsed
                        return collapsed ? (
                            <Tooltip key={item.id}>
                                <TooltipTrigger asChild>
                                    <div className="relative">{btn}</div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="text-xs">
                                    {item.label}
                                    {badgeCount ? ` (${badgeCount})` : ""}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <div key={item.id}>{btn}</div>
                        );
                    })}
                </nav>

                <Separator/>

                {/* User */}
                <div className="p-3">
                    {collapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-full"
                                    onClick={handleLogOut}
                                >
                                    <LogOut size={15} className="text-muted-foreground"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">
                                Logout ({user.user_name})
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button variant="ghost" title="Logout" className="w-full" onClick={handleLogOut}>
                            <div className="w-full flex items-center justify-between gap-2 text-sm">
                                <p className="text-sm font-medium truncate">{user.user_name}</p>
                                <LogOut size={15} className="text-muted-foreground shrink-0"/>
                            </div>
                        </Button>
                    )}
                </div>
            </aside>
        </TooltipProvider>
    );
}

export default Sidebar;