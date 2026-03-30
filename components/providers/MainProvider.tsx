'use client'
import React, {useEffect} from 'react';
import {getRobotsList} from "@/futures/robots/getRobotsList";
import {useQuery} from "@tanstack/react-query";
import {useRobotsStore} from "@/store/robotsStore";
import {useStockStore} from "@/store/stock";
import {getAllParts} from "@/futures/stock/getAllParts";
import {getLocationsSummary} from "@/futures/stock/getLocationsSummary";
import {Toaster} from "@/components/ui/sonner";
import Snow from "@/app/snow";
import {getAllStockHistory} from "@/futures/stock/getAllStockHistory";
import {useSessionStore} from "@/store/session";

const MainProvider = () => {
    const session = useSessionStore(state => state.currentSession)
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    });

    const setRobots = useRobotsStore(state => state.setRobots)
    const setStockTemplates = useStockStore(state => state.set_items_templates)
    const setStockSummary = useStockStore(state => state.set_stock_summary)
    const setStockHistory = useStockStore(state => state.set_stock_history)

    const { data, error, isLoading } = useQuery({
        queryKey: ['robots-list'],
        queryFn: () => getRobotsList(session),
        enabled: !!session
    });

    const { data: StockTemplates } = useQuery({
        queryKey: ['stock_items_template'], // better name than 'todos'
        queryFn: () => getAllParts(),
        enabled: !!session
    });

    const { data: StockSummary } = useQuery({
        queryKey: ['stock_cells_summary'], // better name than 'todos'
        queryFn: () => getLocationsSummary(),
        enabled: !!session
    });

    const {data: IStockHistory} = useQuery({
        queryKey: ['stockHistory-full'],
        queryFn: async () => getAllStockHistory(session),
        enabled: !!session,
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
            console.log(IStockHistory);
            setStockHistory(IStockHistory);
        }
    }, [IStockHistory]);


    return (
        <div>
            {isClient && <Snow />}
            {isClient && <Toaster richColors position="bottom-right" />}
        </div>
    )
};

export default MainProvider;