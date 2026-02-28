'use client'
import React, {useEffect} from 'react';
import {getRobotsList} from "@/futures/robots/getRobotsList";
import {useQuery} from "@tanstack/react-query";
import {useRobotsStore} from "@/store/robotsStore";
import {useStockStore} from "@/store/stock";
import {getAllParts} from "@/futures/stock/getAllParts";
import {getLocationsSummary} from "@/futures/stock/getLocationsSummary";
import {AuthService} from "@/services/authService";
import {useRouter} from "next/navigation";
import {Toaster} from "@/components/ui/sonner";
import Snow from "@/app/snow";
import {getAllStockHistory} from "@/futures/stock/getAllStockHistory";
import {toast} from "sonner";

const MainProvider = () => {
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    });

    const setRobots = useRobotsStore(state => state.setRobots)
    const setStockTemplates = useStockStore(state => state.set_items_templates)
    const setStockSummary = useStockStore(state => state.set_stock_summary)
    const setStockHistory = useStockStore(state => state.set_stock_history)

    const { data, error, isLoading } = useQuery({
        queryKey: ['robots-list'], // better name than 'todos'
        queryFn: () => getRobotsList(),
    });

    const { data: StockTemplates } = useQuery({
        queryKey: ['stock_items_template'], // better name than 'todos'
        queryFn: () => getAllParts(),
    });

    const { data: StockSummary } = useQuery({
        queryKey: ['stock_cells_summary'], // better name than 'todos'
        queryFn: () => getLocationsSummary(),
    });

    const {data: IStockHistory} = useQuery({
        queryKey: ['stockHistory-full'],
        queryFn: async () => getAllStockHistory(),
        retry: 3
    });

    useEffect(() => {
        if (data !== undefined) {
            setRobots(data);
        }
    }, [data]);

    useEffect(() => {
        if (StockTemplates !== undefined) {
            setStockTemplates(StockTemplates);
        }
    }, [StockTemplates]);

    useEffect(() => {
        if (StockSummary !== undefined) {
            setStockSummary(StockSummary);
        }
    }, [StockSummary]);

    useEffect(() => {
        if (IStockHistory !== undefined) {
            setStockHistory(IStockHistory);
        }
    }, [IStockHistory]);

    const handleOffline = () => {
        toast.error(`It's seems what you lost you network connection. Please check it`)
    }

    useEffect(() => {
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('offline', handleOffline)
        }
    }, [])


    return (
        <div>
            {isClient && <Snow />}
            {isClient && <Toaster richColors position="bottom-right" />}
        </div>
    )
};

export default MainProvider;