'use client'
import React, { useEffect, useState } from 'react';
import { Loader, LogOut, Warehouse, ArrowRight, AlertTriangle, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user";
import { AuthService } from "@/services/authService";
import { toast } from "sonner";
import { SessionService } from "@/services/sessionService";
import { WarehouseService } from "@/services/warehouseService";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {useSessionStore} from "@/store/session";

const Page = () => {
    const router = useRouter();
    const user = useUserStore(state => state.currentUser);
    const setSessionStore = useSessionStore(state => state.setCurrentSession);

    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    const { data: sessionData, isLoading: isSessionLoading } = useQuery({
        queryKey: ['user-session', user?.auth_id ?? ""],
        enabled: !!user,
        retry: 3,
        queryFn: () => SessionService.getCurrentSession(user?.auth_id ?? "")
    });

    const { data: warehouses = [], isLoading: isWarehousesLoading } = useQuery({
        queryKey: ['warehouses'],
        enabled: !!user,
        queryFn: () => WarehouseService.getWarehousesList()
    });

    useEffect(() => {
        if (user?.home_warehouse && !selectedWarehouseId) {
            setSelectedWarehouseId(user.home_warehouse);
        }
    }, [user]);

    useEffect(() => {
        if (sessionData) {
            router.push(`/dashboard/${user?.auth_id ?? ""}`);
        }
    }, [sessionData]);

    const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

    const createSession = async () => {
        if (!user) return toast.error('No user found.');
        if (!selectedWarehouseId) return toast.error('Please select a warehouse.');

        setIsStarting(true);
        try {
            await SessionService.startSession(user.id, selectedWarehouseId, selectedWarehouse?.title ?? "None");
            window.location.href = `/dashboard/${user.auth_id}`
        } catch {
            toast.error('Failed to start session. Please try again.');
            setIsStarting(false);
        }
    };

    const handleLogOut = async () => {
        await AuthService.logout();
        window.location.href = "/login";
    };

    if (isSessionLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
                        Checking session status
                    </p>
                </div>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-sm space-y-6">

                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl border flex items-center justify-center bg-card">
                                <Warehouse className="w-7 h-7 text-foreground" />
                            </div>
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                                <AlertTriangle className="w-3 h-3 text-yellow-950" />
                            </div>
                        </div>
                    </div>

                    {/* Text */}
                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-semibold tracking-tight">No active session</h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Select a warehouse and start a session to continue working.
                        </p>
                    </div>

                    {/* Warehouse selector */}
                    <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">
                            Warehouse
                        </p>
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(prev => !prev)}
                                disabled={isWarehousesLoading}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-card",
                                    "text-sm font-medium transition-colors",
                                    "hover:bg-accent focus:outline-none",
                                    dropdownOpen && "border-foreground/30"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        selectedWarehouse ? "bg-green-500" : "bg-muted-foreground/30"
                                    )} />
                                    {isWarehousesLoading ? (
                                        <span className="text-muted-foreground">Loading warehouses...</span>
                                    ) : selectedWarehouse ? (
                                        <span>{selectedWarehouse.title}</span>
                                    ) : (
                                        <span className="text-muted-foreground">Select warehouse</span>
                                    )}
                                </div>
                                <ChevronDown className={cn(
                                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                                    dropdownOpen && "rotate-180"
                                )} />
                            </button>

                            {/* Dropdown */}
                            {dropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full rounded-xl border bg-card shadow-lg overflow-hidden">
                                    <div className="max-h-52 overflow-y-auto py-1">
                                        {warehouses.map(warehouse => (
                                            <button
                                                key={warehouse.id}
                                                onClick={() => {
                                                    setSelectedWarehouseId(warehouse.id);
                                                    setDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-4 py-2.5 text-sm",
                                                    "hover:bg-accent transition-colors text-left",
                                                    selectedWarehouseId === warehouse.id && "bg-accent"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Warehouse className="w-4 h-4 text-muted-foreground" />
                                                    <span>{warehouse.title}</span>
                                                    {warehouse.id === user?.home_warehouse && (
                                                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                            home
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedWarehouseId === warehouse.id && (
                                                    <Check className="w-4 h-4 text-foreground" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                        <Button
                            className="w-full"
                            onClick={createSession}
                            disabled={!selectedWarehouseId || isStarting}
                        >
                            {isStarting ? (
                                <Loader className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <ArrowRight className="w-4 h-4 mr-2" />
                            )}
                            {isStarting ? 'Starting session...' : 'Start session'}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground"
                            onClick={handleLogOut}
                            disabled={isStarting}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                        </Button>
                    </div>

                </div>
            </div>
        );
    }
};

export default Page;