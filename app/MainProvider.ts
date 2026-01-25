'use client'
import React, {useEffect} from 'react';
import {getRobotsList} from "@/futures/robots/getRobotsList";
import {useQuery} from "@tanstack/react-query";
import {useRobotsStore} from "@/store/robotsStore";
import {useStockStore} from "@/store/stock";
import {getAllParts} from "@/futures/stock/getAllParts";

const MainProvider = () => {
    const setRobots = useRobotsStore(state => state.setRobots)
    const setStockTemplates = useStockStore(state => state.set_items_templates)

    const { data, error, isLoading } = useQuery({
        queryKey: ['robots-list'], // better name than 'todos'
        queryFn: () => getRobotsList(),
    });

    const { data: StockTemplates } = useQuery({
        queryKey: ['stock_items_template'], // better name than 'todos'
        queryFn: () => getAllParts(),
    });

    useEffect(() => {
        setRobots(data);
    }, [data]);

    useEffect(() => {
        if (StockTemplates !== undefined) {
            setStockTemplates(StockTemplates);
        }
    }, [StockTemplates]);

    return null
};

export default MainProvider;