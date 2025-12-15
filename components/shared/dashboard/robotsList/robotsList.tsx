'use client'
import React, {useEffect, useState} from 'react';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Label} from "@/components/ui/label";
import {Bot, Dot} from "lucide-react";
import {ParamValue} from "next/dist/server/request/params";
import {useRobotsStore} from "@/store/robotsStore";
import {Input} from "@/components/ui/input";
import {IRobot} from "@/types/robot/robot";
import {Card} from "@/components/ui/card";

const RobotsList = ({card_id}: { card_id: ParamValue }) => {
    const {robots, setRobots} = useRobotsStore()

    const [robot_number_value, setRobot_number_value] = useState<string>("")
    const [filtered_data, setFiltered_data] = useState<IRobot[]>([])

    useEffect(() => {
        if (robot_number_value.length > 0) {
            const filtered = robots.filter((robot: IRobot) => robot.robot_number.toString().includes(robot_number_value))
            setFiltered_data(filtered)
        } else {
            setFiltered_data([])
        }
    }, [robot_number_value, robots]);

    return (
        <div className="border rounded-xl mb-4 p-2">
            <div className={`md:flex md:justify-between grid flex-wrap gap-4 my-2 px-1`}>
                <div>
                    <Button variant={`outline`}>Export Excel</Button>
                </div>
                {filtered_data.length > 0 &&
                    <div className={`flex flex-wrap gap-2`}>
                        {filtered_data.slice(0, 5).map((item, i) => (
                            <Card className={`p-2 w-full`}>
                                <div className={`flex gap-2 justify-center w-full`}>
                                    <Label className={`text-xs text-muted-foreground`}>{dayjs(item.updated_at).format('HH:mm · MMM D, YYYY')}</Label>
                                    <Link href={`/robot/${item.id}`}>
                                        <Button variant="link"><Bot/> {item.robot_number}</Button>
                                    </Link>
                                    <Label className={`text-xs text-muted-foreground`}>{item.status}</Label>
                                </div>
                            </Card>
                        ))}
                    </div>
                }
                <div>
                    <Input
                        value={robot_number_value}
                        onChange={(e) => setRobot_number_value(e.target.value)}
                        placeholder={`Search Robots by Number`}
                        className={`w-full`}
                    />
                </div>
            </div>
            <Table>
                <TableCaption>A list of recent Robots.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>N</TableHead>
                        <TableHead>Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Update Time</TableHead>
                        <TableHead>Create Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {robots.slice(0, 20).map((robot, index) => (
                        <TableRow key={robot.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                                <Link href={`/robot/${robot.id}`}>
                                    <Button variant="link">{robot.robot_number}</Button>
                                </Link>
                            </TableCell>
                            <TableCell>{robot.robot_type}</TableCell>
                            <TableCell>
                                <Dot className="text-green-500 animate-ping inline"/> {robot.status.toUpperCase()}
                            </TableCell>
                            <TableCell>{dayjs(robot.updated_at).format('HH:mm · MMM D, YYYY')}</TableCell>
                            <TableCell>{dayjs(robot.created_at).format('HH:mm · MMM D, YYYY')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default RobotsList;