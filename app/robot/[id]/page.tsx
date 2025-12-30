'use client'
import React, {useEffect, useState} from 'react';
import {useParams} from "next/navigation";
import {IRobot, IRobotApiResponse} from "@/types/robot/robot";
import {Label} from "@/components/ui/label";
import dayjs from "dayjs";
import {
    CirclePlus, Construction, Dot, Frown, Laugh, Loader,
    Phone, RefreshCw, SmilePlus,
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
import {Button} from "@/components/ui/button";
import {changeRobotStatus} from "@/futures/robots/changeRobotStatus";
import {toast} from "sonner";
import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {IUser} from "@/types/user/user";


const Page = () => {
    const params = useParams();
    const robot_id = params?.id;

    const robots_list = useRobotsStore(state => state.robots)

    const [current_Robot, setCurrent_Robot] = useState<IRobot | null>(null)

    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (robots_list) {
            const robot_data = robots_list.find(item => item.id === Number(robot_id))
            if (robot_data) setCurrent_Robot(robot_data)
        }
    }, [robots_list])

    const user_store = useUserStore(state => state.current_user)

    const setNewStatus = useRobotsStore(state => state.updateRobotStatus)

    const sendToMaintenance = async () => {
        try {
            if (!current_Robot) return;
            if (!user_store) return;

            setIsLoading(true);
            const res = await changeRobotStatus({
                robot_id: current_Robot.id,
                robot_number: Number(current_Robot.robot_number),
                card_id: user_store?.card_id || 0,
                new_status: `离线 | Offline`, // Use the stored clean key
                old_status: `在线 | Online`
            });

            if (!res) throw new Error("Can't send robot to maintenance");

            setNewStatus(current_Robot.id, "离线 | Offline" ,{
                id: 9999,
                add_by: user_store?.card_id || 0,
                robot_id: current_Robot.id || 0,
                created_at: Date.now() as Timestamp,
                new_status: `离线 | Offline`,
                old_status: `在线 | Online`,
                robot_number: Number(current_Robot.robot_number) || 0,
                user: user_store,
            })

            toast.success("Robot sent to maintenance");

        } catch (error) {
            error && toast.error(error.toString() || "Unknown error");
        } finally {
            setTimeout(() => setIsLoading(false), 1000);
        }
    }

    const sendToMap = async () => {
        try {
            if (!current_Robot) return;
            if (!user_store) return;

            setIsLoading(true);

            const res = await changeRobotStatus({
                robot_id: current_Robot.id,
                robot_number: Number(current_Robot.robot_number),
                card_id: user_store?.card_id || 0,
                new_status: `在线 | Online`, // Use the stored clean key
                old_status: `离线 | Offline`
            });

            if (!res) throw new Error("Can't send robot to map");

            setNewStatus(current_Robot.id, "在线 | Online" ,{
                id: 9999,
                add_by: user_store?.card_id || 0,
                robot_id: current_Robot.id || 0,
                created_at: Date.now() as Timestamp,
                new_status: `在线 | Online`,
                old_status: `离线 | Offline`,
                robot_number: Number(current_Robot.robot_number) || 0,
                user: user_store,
            })

            toast.success("Robot sent to map");

        } catch (error) {
            error && toast.error(error.toString() || "Unknown error");
        } finally {
            setTimeout(() => setIsLoading(false), 1000);
        }
    }

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

                    <div className={`grid md:grid-cols-2 gap-2`}>
                        {current_Robot.status === "在线 | Online"
                            ?
                            <Button
                                variant={`outline`}
                                disabled={isLoading}
                                onClick={sendToMaintenance}
                                className={`w-full`}
                            >
                                {isLoading ? <Loader className={`animate-spin`} /> : <Construction/>}
                                Send Maintenance
                            </Button>
                            :
                            <Button
                                disabled={isLoading}
                                onClick={sendToMap}
                                className={`w-full`}
                            >
                                {isLoading ? <Loader className={`animate-spin`} /> : <SmilePlus/>}
                                Send to map
                            </Button>
                        }
                        <PartsPicker
                            robot={current_Robot}
                        />
                    </div>
                </div>

                <hr className={`my-4`}/>

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
