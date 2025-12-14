'use client'
import React, {useEffect} from 'react';
import {getRobotsList} from "@/futures/robots/getRobotsList";
import {useQuery} from "@tanstack/react-query";
import {useRobotsStore} from "@/store/robotsStore";

const MainProvider = () => {

    const setRobots = useRobotsStore(state => state.setRobots)

    const { data, error, isLoading } = useQuery({
        queryKey: ['robots-list'], // better name than 'todos'
        queryFn: () => getRobotsList(),
    });

    useEffect(() => {
        setRobots(data);
    }, [data]);

    return null
};

export default MainProvider;