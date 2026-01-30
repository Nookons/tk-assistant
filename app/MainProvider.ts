'use client'
import React, {useEffect} from 'react';
import {getRobotsList} from "@/futures/robots/getRobotsList";
import {useQuery} from "@tanstack/react-query";
import {useRobotsStore} from "@/store/robotsStore";
import {useStockStore} from "@/store/stock";
import {getAllParts} from "@/futures/stock/getAllParts";
import {getLocationsSummary} from "@/futures/stock/getLocationsSummary";

const MainProvider = () => {
    const setRobots = useRobotsStore(state => state.setRobots)
    const setStockTemplates = useStockStore(state => state.set_items_templates)
    const setStockSummary = useStockStore(state => state.set_stock_summary)

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

    useEffect(() => {
        setRobots(data);
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

    return null
};

export default MainProvider;