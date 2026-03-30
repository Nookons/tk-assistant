import React, {useMemo, useState} from 'react';
import {useRobotsStore} from "@/store/robotsStore";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import dayjs from "dayjs";
import {IRobot} from "@/types/robot/robot";
import Link from "next/link";
import {ArrowRight, Bot, Minus, CircleAlert, CircleCheck, ChevronLeft, ChevronRight, SearchX} from "lucide-react";
import PartsCell from "./PartsCell";
import {Input} from "@/components/ui/input";
import {Toggle} from "@/components/ui/toggle";
import {Button} from "@/components/ui/button";
import {timeToString} from "@/utils/timeToString";

const PAGE_SIZE = 25;

function getStatusVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
    if (!status) return "outline";
    const s = status.toLowerCase();
    if (s.includes("在线 | online")) return "default";
    if (s.includes("离线 | offline")) return "destructive";
    return "outline";
}

interface RobotsHistoryProps {
    previewLimit?: number;
    warehouse?: string;
}

// --- Empty state variants ---
function EmptyNoRobots() {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Bot size={28} className="opacity-40"/>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium">No robots yet</p>
                <p className="text-xs opacity-60 mt-0.5">Robots will appear here once added</p>
            </div>
        </div>
    );
}

function EmptyNoResults({hasFilters}: { hasFilters: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <SearchX size={28} className="opacity-40"/>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium">
                    {hasFilters ? "No robots match your filters" : "No robots here"}
                </p>
                <p className="text-xs opacity-60 mt-0.5">
                    {hasFilters ? "Try adjusting the search or toggle" : "Nothing to display"}
                </p>
            </div>
        </div>
    );
}

const RobotsList = ({previewLimit = 5}: RobotsHistoryProps) => {
    const robots = useRobotsStore(state => state.robots);
    const [search_value, setSearch_value] = useState<string>("")
    const [isBrokenSearch, setIsBrokenSearch] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);

    const isPaginated = previewLimit > PAGE_SIZE;
    const hasFilters = search_value.trim() !== "" || isBrokenSearch;

    const filteredData = useMemo<IRobot[]>(() => {
        if (!robots) return [];
        const query = search_value.trim().toLowerCase();

        return robots
            .filter(robot =>
                query === "" || robot.robot_number.toString().toLowerCase().includes(query)
            )
            .filter(robot => {
                if (!isBrokenSearch) return true;
                return robot.status === "离线 | Offline";
            })
            .sort((a, b) => dayjs(b.updated_at).valueOf() - dayjs(a.updated_at).valueOf())
            .slice(0, previewLimit);
    }, [robots, search_value, isBrokenSearch, previewLimit]);

    const displayData = useMemo<IRobot[]>(() => {
        if (!isPaginated) return filteredData;
        const start = (page - 1) * PAGE_SIZE;
        return filteredData.slice(start, start + PAGE_SIZE);
    }, [filteredData, isPaginated, page]);

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

    const handleSearchChange = (value: string) => {
        setSearch_value(value);
        setPage(1);
    };

    const handleBrokenToggle = (value: boolean) => {
        setIsBrokenSearch(value);
        setPage(1);
    };

    // No data at all — don't show filters, just empty state
    if (!robots || robots.length === 0) {
        return <EmptyNoRobots/>;
    }

    const Pagination = () => (
        isPaginated && totalPages > 1 ? (
            <div className="flex items-center justify-end gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                    <ChevronLeft size={14}/>
                </Button>
                <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                    <ChevronRight size={14}/>
                </Button>
            </div>
        ) : null
    );

    return (
        <div>
            <p className="text-xs text-muted-foreground">
                Showed robots: {filteredData.length}
                {isPaginated && ` · Page ${page} of ${totalPages}`}
            </p>
            <div className="my-2 flex items-center gap-2 justify-between">
                <Input
                    value={search_value}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Robot number"
                />
                <Toggle
                    aria-label="Toggle broken"
                    variant="outline"
                    pressed={isBrokenSearch}
                    onPressedChange={handleBrokenToggle}
                >
                    {isBrokenSearch ? <CircleCheck/> : <CircleAlert/>}
                </Toggle>
            </div>

            {displayData.length === 0 ? (
                <EmptyNoResults hasFilters={hasFilters}/>
            ) : (
                <>
                    <Pagination/>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs">Robot</TableHead>
                                <TableHead className="text-xs">Type</TableHead>
                                <TableHead className="text-xs">Warehouse</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs">Updated</TableHead>
                                <TableHead className="text-xs">Last Part</TableHead>
                                <TableHead className="text-xs">Last changed by</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayData.map((robot: IRobot) => (
                                <TableRow key={robot.id} className="group">
                                    <TableCell>
                                        <Link
                                            href={`/robot/${robot.id}`}
                                            className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors hover:underline"
                                        >
                                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                                                <Bot size={14} className="text-muted-foreground group-hover:text-primary transition-colors"/>
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
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <ArrowRight size={12} className="text-muted-foreground shrink-0"/>
                                            <Badge variant={getStatusVariant(robot.status)} className="text-[11px] px-2 py-0">
                                                {robot.status}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p>{timeToString(robot.updated_at)}</p>
                                    </TableCell>
                                    <TableCell>
                                        <PartsCell parts_history={robot.parts_history?.sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())}/>
                                    </TableCell>
                                    <TableCell>
                                        {robot.updated_by ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={robot.updated_by.avatar_url ?? ""}/>
                                                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                                        {robot.updated_by.user_name.toUpperCase().slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                                                    <Link href={`/user/${robot.updated_by.auth_id}`} className="hover:underline hover:text-foreground">
                                                        {robot.updated_by.user_name}
                                                    </Link>
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/40">None</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Pagination/>
                </>
            )}
        </div>
    );
};

export default React.memo(RobotsList);