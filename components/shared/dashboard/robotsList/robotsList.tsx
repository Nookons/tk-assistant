'use client'
import React, {useEffect, useState} from 'react';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import {IRobot} from "@/types/robot/robot";
import Link from "next/link";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Bot, Dot} from "lucide-react";
import {ParamValue} from "next/dist/server/request/params";
import {useRobotsStore} from "@/store/robotsStore";

const RobotsList = ({card_id}: {card_id: ParamValue}) => {
    const {robots, setRobots} = useRobotsStore()

    const updateRobotStatus = async (id: number, value: string) => {
        try {
            const res = await fetch(`/api/robots/status-update`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id, new_status: value, card_id})
            });

            if (!res.ok) throw new Error('Update failed');

            const response = await res.json();

            const mutaded_data = robots.map(robot =>
                robot.id === response.id ? {...response} : robot
            )

            setRobots(mutaded_data);

        } catch (error) {
            console.error('Failed to update:', error);
        }
    };

    return (
        <div className="border rounded-xl mb-4 p-2">
            <div className="p-2 mb-4">
                <Label className="text-base">Robots on maintenance area</Label>
            </div>
            <Table>
                <TableCaption>A list of recent Robots.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>N</TableHead>
                        <TableHead>Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Problem Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Note</TableHead>
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
                            <TableCell>{robot.type_problem}</TableCell>
                            <TableCell>
                                <Select
                                    //disabled={robot.status === "done"}
                                    value={robot.status}
                                    onValueChange={(value) => updateRobotStatus(robot.id, value)}
                                >
                                    <SelectTrigger className="w-[230px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="wait">
                                            <Dot className="text-red-500 animate-ping inline" /> Waiting for Repair
                                        </SelectItem>
                                        <SelectItem value="inspections">
                                            <Dot className="text-yellow-500 animate-ping inline" /> Inspections Problem
                                        </SelectItem>
                                        <SelectItem value="repair">
                                            <Dot className="text-yellow-500 animate-ping inline" /> In Repair process
                                        </SelectItem>
                                        <SelectItem value="done">
                                            <Dot className="text-green-500 animate-ping inline" /> Solved
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                {robot.problem_note.length > 35
                                    ? `${robot.problem_note.slice(0, 35)}...`
                                    : robot.problem_note}
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