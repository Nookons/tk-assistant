import React, {useEffect, useState} from 'react';
import {
    useQuery,
} from '@tanstack/react-query';
import {ParamValue} from "next/dist/server/request/params";
import RobotsList from "@/components/shared/dashboard/robotsList/robotsList";
import {getRobotsList} from "@/futures/robots/getRobotsList";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {Bot} from "lucide-react";
import {IRobot} from "@/types/robot/robot";
import {useRobotsStore} from "@/store/robotsStore";
import ListStats from "@/components/shared/dashboard/robotsList/ListStats";

const robotsListProvider = ({card_id}: {card_id: ParamValue}) => {
    if (!card_id) return null;

    const robots_list = useRobotsStore(state => state.robots)

    if (!robots_list) return (
        <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Bot className={`animate-bounce`} />
                </EmptyMedia>
                <EmptyTitle>No robots on maintenance</EmptyTitle>
                <EmptyDescription>
                    You did a greate job! There are no robots on maintenance at the moment. Keep up the good work and enjoy your day..
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>

            </EmptyContent>
        </Empty>
    );

    return (
        <div>
            <ListStats robots={robots_list} />
            <RobotsList card_id={card_id} />
        </div>
    )
};

export default robotsListProvider;
