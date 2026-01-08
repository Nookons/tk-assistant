'use client'
import React, {useEffect, useState} from 'react';
import {useParams} from "next/navigation";
import {IRobot, IRobotApiResponse} from "@/types/robot/robot";
import {Label} from "@/components/ui/label";
import {Bubbles} from "lucide-react";
import RobotHistory from "@/components/shared/robot/changedParts/RobotHistory";
import PartsPicker from "@/components/shared/robot/addNewParts/partsPicker";
import AddCommentRobot from "@/components/shared/robot/addComment/AddCommentRobot";
import CommentsList from "@/components/shared/robot/commentsList/CommentsList";
import Image from "next/image";
import {useRobotsStore} from "@/store/robotsStore";
import SendRobotToMaintance from "@/components/shared/robot/sendRobotToMaintance/sendRobotToMaintance";
import {Badge} from "@/components/ui/badge";
import {timeToString} from "@/utils/timeToString";
import SendRobotToMap from "@/components/shared/robot/sendRobotToMap/sendRobotToMap";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import PartCopy from "@/components/shared/dashboard/PartCopy/PartCopy";




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


    if (!current_Robot) return null;

    return (
        <div className="max-w-[1600px] m-auto grid md:grid-cols-[1fr_650px] gap-8 px-4">
            {/* ROBOT INFO */}
            <div className="">
                <div className={`grid md:grid-cols-2 gap-4 py-4`}>
                    <div className={`flex relative justify-between md:justify-start items-center gap-2`}>
                        <div className={`flex items-center gap-2`}>
                            {current_Robot.robot_type === "K50H"
                                ?
                                <>
                                    {current_Robot.status === "离线 | Offline"
                                        ? <Image src={`/img/K50H_red.svg`} alt={`robot_img`} width={30} height={30}/>
                                        : <Image src={`/img/K50H_green.svg`} alt={`robot_img`} width={30} height={30}/>
                                    }
                                </>
                                :
                                <>
                                    {current_Robot.status === "离线 | Offline"
                                        ? <Image src={`/img/A42T_red.svg`} alt={`robot_img`} width={30} height={30}/>
                                        : <Image src={`/img/A42T_Green.svg`} alt={`robot_img`} width={30} height={30}/>
                                    }
                                </>
                            }
                            <Label
                                className={`font-bold text-base md:text-2xl`}>{current_Robot.robot_number}</Label>
                        </div>
                        <div className={`flex items-center gap-2`}>
                            <Label>{current_Robot.status}</Label>
                        </div>
                    </div>
                </div>

                <div className={`flex flex-wrap gap-2`}>

                    <div>
                        {current_Robot.status === "在线 | Online"
                            ? <SendRobotToMaintance current_Robot={current_Robot} />
                            : <SendRobotToMap current_Robot={current_Robot} />
                        }
                    </div>

                    <div>
                        <PartsPicker
                            robot={current_Robot}
                        />
                    </div>

                    {current_Robot.parts_history.length > 0 &&
                    <div>
                        <PartCopy robot={current_Robot}/>
                    </div>
                    }
                </div>

                <hr className={`my-4`}/>

                <div className="">
                    <div className={`flex flex-col md:grid md:grid-cols-1  items-start gap-4`}>
                        <div className={`flex flex-col gap-2 flex-wrap w-full`}>

                            {current_Robot.type_problem.length > 0
                            ?
                                <div className={`rounded p-2 w-full flex flex-col gap-2`}>
                                    <Badge variant={`destructive`} className="">{current_Robot.type_problem}</Badge>
                                    <Label className="text-xl">{current_Robot.problem_note}</Label>
                                    <div className={`mt-4`}>
                                        <p className="text-xs text-muted-foreground">{current_Robot.updated_by?.user_name} - {current_Robot.updated_by?.warehouse}</p>
                                        <p className="text-xs text-muted-foreground">{timeToString(current_Robot.updated_at)}</p>
                                    </div>
                                </div>
                            :
                                <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Bubbles  />
                                        </EmptyMedia>
                                        <EmptyTitle>No Issue</EmptyTitle>
                                        <EmptyDescription>
                                            Robot going well and without any problems.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            }

                        </div>

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
