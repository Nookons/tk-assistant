import React, {useMemo, useState} from 'react';
import {useRobotsStore} from "@/store/robotsStore";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import dayjs from "dayjs";
import {IRobot} from "@/types/robot/robot";
import Link from "next/link";
import {ArrowRight, BookmarkIcon, Bot, Minus, CircleAlert, CircleCheck} from "lucide-react";
import PartsCell from "./PartsCell";
import {Input} from "@/components/ui/input";
import {Toggle} from "@/components/ui/toggle";

function getStatusVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
    if (!status) return "outline";
    const s = status.toLowerCase();
    if (s.includes("active") || s.includes("ok") || s.includes("work")) return "default";
    if (s.includes("repair") || s.includes("pending")) return "secondary";
    if (s.includes("error") || s.includes("broken") || s.includes("off")) return "destructive";
    return "outline";
}

interface RobotsHistoryProps {
    previewLimit?: number;
    warehouse?: string;

}


const RobotsList = ({previewLimit = 5, warehouse = 'GLPC'}: RobotsHistoryProps) => {
    const robots = useRobotsStore(state => state.robots);
    const [search_value, setSearch_value] = useState<string>("")

    const [isBrokenSearch, setIsBrokenSearch] = useState<boolean>(false);

    const displayData = useMemo<IRobot[]>(() => {
        if (!robots) return [];

        const query = search_value.trim().toLowerCase();

        return robots
            .filter(robot => robot.warehouse === warehouse)
            .filter(robot =>
                query === "" || robot.robot_number.toString().toLowerCase().includes(query)
            )
            .filter(robot => {
                if (!isBrokenSearch) return true; // фильтр выключен — показываем всех
                return robot.status === "离线 | Offline";
            })
            .sort((a, b) => dayjs(b.updated_at).valueOf() - dayjs(a.updated_at).valueOf())
            .slice(0, previewLimit);
    }, [robots, warehouse, search_value, isBrokenSearch]); // ← добавил warehouse в deps

    if (!robots) return null;

    return (
        <div>
            <p className={`text-xs text-muted-foreground`}>Showed robots: {displayData.length}</p>
            <div className={`my-2 flex items-center gap-2 justify-between`}>
                <Input
                    value={search_value}
                    onChange={(e) => setSearch_value(e.target.value)}
                    placeholder={'Robot number'}
                />
                <Toggle
                    aria-label="Toggle broken"
                    variant="outline"
                    pressed={isBrokenSearch}
                    onPressedChange={(v) => setIsBrokenSearch(v)}
                >
                    {isBrokenSearch ? <CircleCheck/> : <CircleAlert/>}
                </Toggle>
            </div>
            {displayData.length === 0
            ?
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                    <Bot size={32} className="opacity-30"/>
                    <p className="text-sm">No robots here</p>
                </div>
            :
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs">Robot</TableHead>
                            <TableHead className="text-xs">Type</TableHead>
                            <TableHead className="text-xs">Warehouse</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Last Part</TableHead>
                            <TableHead className="text-xs">Last changed by</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayData.map((robot: IRobot) => {
                            const lastStatus = robot.status_history.at(-1);
                            const lastPart = robot.parts_history.at(-1);

                            return (
                                <TableRow key={robot.id} className="group">

                                    {/* Robot number */}
                                    <TableCell>
                                        <Link
                                            href={`/robot/${robot.id}`}
                                            className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors hover:underline"
                                        >
                                            <div
                                                className="flex h-7 w-7 items-center justify-center rounded-md bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                                                <Bot size={14}
                                                     className="text-muted-foreground group-hover:text-primary transition-colors"/>
                                            </div>
                                            {robot.robot_number}
                                        </Link>
                                    </TableCell>


                                    <TableCell className="text-sm text-muted-foreground">
                                        {robot.robot_type}
                                    </TableCell>


                                    <TableCell className="text-sm text-muted-foreground">
                                        {robot.warehouse || <Minus size={14} className="text-muted-foreground/40"/>}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <ArrowRight size={12} className="text-muted-foreground shrink-0"/>
                                            <Badge variant={getStatusVariant(robot.status)}
                                                   className="text-[11px] px-2 py-0">
                                                {robot.status}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    {/* Last Part */}
                                    <TableCell>
                                        <PartsCell parts_history={robot.parts_history}/>
                                    </TableCell>

                                    {/* Updated by */}
                                    <TableCell>
                                        {robot.updated_by ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={robot.updated_by.avatar_url}/>
                                                    <AvatarFallback
                                                        className="text-xs bg-primary text-primary-foreground">{robot.updated_by.user_name.toUpperCase().slice(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                                            <Link href={`/user/${robot.updated_by.id}`}
                                                  className="hover:underline hover:text-foreground">{robot.updated_by.user_name}</Link>
                                        </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/40">None</span>
                                        )}
                                    </TableCell>

                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            }
        </div>
    );
};

export default React.memo(RobotsList);