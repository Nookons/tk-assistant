'use client'
import React, {useEffect} from 'react';
import {getRobotsList} from "@/futures/robots/getRobotsList";
import {useQuery} from "@tanstack/react-query";
import {useRobotsStore} from "@/store/robotsStore";
import {IRobot} from "@/types/robot/robot";
import {changeRobotStatus} from "@/futures/robots/changeRobotStatus";
import {useUserStore} from "@/store/user";

const MainProvider = () => {

    const setRobots = useRobotsStore(state => state.setRobots)

    //const user = useUserStore(state => state.current_user)

    const { data, error, isLoading } = useQuery({
        queryKey: ['robots-list'], // better name than 'todos'
        queryFn: () => getRobotsList(),
    });

    useEffect(() => {
        setRobots(data);

        /*if (data && user) {
            data.forEach((item: IRobot, index: number) => {
                console.log(item);
                changeRobotStatus
                ({
                    robot_id: item.id,
                    card_id: user.card_id,
                    new_status: `在线 | ONLINE`,
                    old_status: "None",
                    robot_number: Number(item.robot_number),

                })
            })

            //在线 | ONLINE
        }*/
    }, [data]);

    return null
};

export default MainProvider;