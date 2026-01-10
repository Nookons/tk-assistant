import React from 'react';
import {useQuery} from "@tanstack/react-query";
import {getStatusChanges} from "@/futures/reports/getStatusChanges";
import dayjs from "dayjs";
import {Item} from "@/components/ui/item";
import Image from "next/image";
import {Label} from "@/components/ui/label";
import {ArrowRight, BotOff, Bug, NotebookText} from "lucide-react";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {Skeleton} from "@/components/ui/skeleton";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";

const StatusChanges = ({date, shift}: { date: Date; shift: string }) => {

    const {data, isLoading, isError} = useQuery({
        queryKey: ['status_changes', date.toString(), shift],
        queryFn: () => getStatusChanges(dayjs(date).format('MM/DD/YYYY'), shift),
        refetchInterval: 1000
    })

    if (isLoading) return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[255px] w-full rounded-xl"/>
        </div>
    );

    if (data && data.length < 1) return (
        <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <BotOff/>
                </EmptyMedia>
                <EmptyTitle>No records</EmptyTitle>
                <EmptyDescription>
                    Nobody change robots status during this shift.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );

    return (
        <div>
            <Label className="text-xl mb-2">Status History:</Label>
            <div className="w-full overflow-x-auto">
                <Table className="w-full table-auto">
                    <TableHeader>
                        <TableRow>
                            <TableHead>IMG</TableHead>
                            <TableHead>Robot</TableHead>
                            <TableHead>Robot Type</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Problem Type</TableHead>
                            <TableHead>Problem Note</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {item.robot.robot_type === "K50H" ? (
                                        <Image
                                            src={item.robot.status === "离线 | Offline" ? "/img/K50H_red.svg" : "/img/K50H_green.svg"}
                                            alt="robot_img"
                                            width={30}
                                            height={30}
                                        />
                                    ) : (
                                        <Image
                                            src={item.robot.status === "离线 | Offline" ? "/img/A42T_red.svg" : "/img/A42T_Green.svg"}
                                            alt="robot_img"
                                            width={30}
                                            height={30}
                                        />
                                    )}
                                </TableCell>
                                <TableCell><Link href={`/robot/${item.robot.id}`}>{item.robot_number}</Link></TableCell>
                                <TableCell>{item.robot.robot_type}</TableCell>
                                <TableCell>{item.user.user_name}</TableCell>
                                <TableCell className="flex items-center gap-2">
                                    <ArrowRight size={18} />
                                    {item.new_status}
                                </TableCell>
                                <TableCell className={!item.type_problem ? "bg-red-500/50" : ""}>
                                    <div className="flex items-center gap-2">
                                        <Bug size={18} />
                                        {item.type_problem || "None"}
                                    </div>
                                </TableCell>
                                <TableCell className={!item.problem_note ? "bg-red-500/50" : ""}>
                                    <div className="flex items-center gap-2">
                                        <NotebookText size={16} />
                                        {item.problem_note || "None"}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default StatusChanges;