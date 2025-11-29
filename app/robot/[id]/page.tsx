'use client'
import React, {useEffect, useState} from 'react';
import {useParams} from "next/navigation";
import {IRobotApiResponse} from "@/types/robot/robot";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import dayjs from "dayjs";
import {Boxes, Check, ChevronDown, Dot, FileBox, Laugh, Settings} from "lucide-react";
import AddCommentRobot from "@/components/shared/robot/addComment/AddCommentRobot";
import CommentsList from "@/components/shared/robot/commentsList/CommentsList";

import PartsPicker from "@/components/shared/robot/changeStatus/partsPicker";


const UserCard = ({title, user}: any) => (
    <div className="rounded-xl ">
        <p><span className="font-semibold">{title}:</span></p>
        <p><span className="font-semibold">Name:</span> {user.user_name}</p>
        <p><span className="font-semibold">Warehouse:</span> {user.warehouse}</p>
        <p><span className="font-semibold">Phone:</span> {user.phone}</p>
    </div>
);

const Page = () => {
    const params = useParams();
    const robot_id = params?.id;

    const [robot_data, setRobotData] = useState<IRobotApiResponse | null>(null);


    const getRobotData = async () => {
        try {
            const res = await fetch(`/api/robots/get-robot?robot_id=${robot_id}`);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const response = await res.json();

            setRobotData({
                ...response,
                type_problem: JSON.parse(response.type_problem)
            });

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (robot_id) getRobotData();
    }, [robot_id]);

    const updateRobotStatus = async (id: number, value: string) => {

    };

    if (!robot_data) return null;

    return (
        <div className="max-w-[1200px] m-auto grid md:grid-cols-[1fr_350px] gap-8 px-4">
            {/* ROBOT INFO */}
            <div className="flex flex-col gap-3 mt-4 bg-muted/50 p-2 rounded">
                <div className={`flex items-center justify-between gap-4`}>
                    <div>
                        <Label
                            className={`font-bold text-base md:text-2xl`}>{robot_data.robot_type} - {robot_data.robot_number}</Label>
                    </div>
                    <div className={`flex items-center gap-2`}>
                        <Dot className="text-green-500 animate-ping inline"/>
                        <Label>{robot_data.status.toUpperCase()}</Label>
                    </div>
                </div>
                <hr/>

                <div className={`grid grid-cols-1 gap-2`}>
                    <PartsPicker
                        robot={robot_data}
                    />
                </div>

                <div className="flex flex-col items-start gap-3">
                    <p className="">{robot_data.problem_note}</p>
                    <div className="mt-4">
                        <Label>Problems List</Label>
                        <div className={`flex gap-2 flex-wrap mt-4`}>
                            {robot_data.type_problem.map((item: string) => (
                                <Badge>
                                    <Label className={`text-xs md:text-base px-2`}>{item}</Label>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className={`gap-2 w-full mt-12 grid ${robot_data.updated_by ? "md:grid-cols-[1fr_1fr]" : "md:grid-cols-[1fr]"}`}>

                        {robot_data.updated_by &&
                            <div className={`bg-muted p-2 rounded`}>
                                <UserCard title="Updated By" user={robot_data.updated_by}/>
                                <Label className={`text-muted-foreground text-xs mt-2`}>{dayjs(robot_data.updated_at).format("HH:mm · MMM D, YYYY")}</Label>
                            </div>
                        }

                        <div className={`bg-muted p-2 rounded`}>
                            <UserCard title="Added By" user={robot_data.add_by}/>
                            <Label className={`text-muted-foreground text-xs mt-2`}>{dayjs(robot_data.created_at).format("HH:mm · MMM D, YYYY")}</Label>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`p-2 rounded`}>
                <AddCommentRobot
                    robot_data={robot_data}
                />
                <div className={`mt-6`}>
                    <CommentsList
                        robot_id={robot_data.id}
                    />
                </div>
            </div>
        </div>
    );
};

export default Page;
