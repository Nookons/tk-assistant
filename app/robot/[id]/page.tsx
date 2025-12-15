'use client'
import React, {useEffect, useState} from 'react';
import {useParams} from "next/navigation";
import {IRobot, IRobotApiResponse} from "@/types/robot/robot";
import {Label} from "@/components/ui/label";
import dayjs from "dayjs";
import {
    CirclePlus, Dot, Frown, Laugh,
    Phone, RefreshCw,
    Warehouse
} from "lucide-react";
import {useUserStore} from "@/store/user";
import RobotHistory from "@/components/shared/robot/changedParts/RobotHistory";
import PartsPicker from "@/components/shared/robot/addNewParts/partsPicker";
import AddCommentRobot from "@/components/shared/robot/addComment/AddCommentRobot";
import CommentsList from "@/components/shared/robot/commentsList/CommentsList";
import Image from "next/image";
import ChangeRobotStatus from "@/components/shared/robot/changeStatus/ChangeRobotStatus";
import {useRobotsStore} from "@/store/robotsStore";


const Page = () => {
    const params = useParams();
    const robot_id = params?.id;

    const robots_list = useRobotsStore(state => state.robots)

    const [current_Robot, setCurrent_Robot] = useState<IRobot | null>(null)

    useEffect(() => {
        if (robots_list) {
            const robot_data = robots_list.find(item => item.id === Number(robot_id))
            if (robot_data) setCurrent_Robot(robot_data)
        }
    }, [robots_list])

    const user_store = useUserStore(state => state.current_user)

    if (!current_Robot) return null;

    return (
        <div className="max-w-[1600px] m-auto grid md:grid-cols-[1fr_650px] gap-8 px-4">
            {/* ROBOT INFO */}
            <div className="">
                <div className={`grid md:grid-cols-2 gap-4 py-4`}>

                    <div className={`flex justify-between md:justify-start items-center gap-2`}>
                        <div className={`flex items-center gap-2`}>
                            <Image src={`/img/A42T_Green.svg`} alt={`robot image`} width={35} height={35}/>
                            <Label
                                className={`font-bold text-base md:text-2xl`}>{current_Robot.robot_number}</Label>
                        </div>
                        <div className={`flex items-center gap-2`}>
                            <Dot className="text-green-500 animate-ping inline"/>
                            <Label>{current_Robot.status.toUpperCase()}</Label>
                        </div>
                    </div>

                    <div className={`grid grid-cols-2 gap-1`}>
                        <PartsPicker
                            robot={current_Robot}
                        />
                        <ChangeRobotStatus
                            robot={current_Robot}
                        />
                    </div>
                </div>

                <hr className={`my-4`} />

                <div className="">
                    <div className={`flex flex-col-reverse md:grid md:grid-cols-2  items-start gap-4`}>
                        <div className={`w-full`}>
                            <div className={`rounded mb-4 w-full`}>
                                <AddCommentRobot
                                    robot_data={current_Robot}
                                />
                            </div>
                            <div className={`w-full`}>
                                <CommentsList
                                    robot_id={current_Robot.id}
                                />
                            </div>
                        </div>

                        <div className={`flex flex-col gap-2 flex-wrap w-full`}>
                            {/*{robot_data.type_problem.map((item: string) => (
                                <div className={`p-2 border border-dashed rounded bg-red-500/20`}>
                                    <Label className={`text-xs md:text-xs px-2`}>{item}</Label>
                                </div>
                            ))}*/}
                            <div className={`border border-dashed rounded p-2 w-full`}>
                                <Label className="text-xs text-muted-foreground mb-4">Note:</Label>
                                <Label className="">{current_Robot.problem_note}</Label>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div>
                <RobotHistory
                    robot={current_Robot}
                />
            </div>
        </div>
    );
};

export default Page;
