'use client'
import React, {useEffect, useState, useRef} from 'react';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Bot, Dot, Search, X, Clock, Filter} from "lucide-react";
import {ParamValue} from "next/dist/server/request/params";
import {useRobotsStore} from "@/store/robotsStore";
import {Input} from "@/components/ui/input";
import {IRobot} from "@/types/robot/robot";
import {Badge} from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import {Separator} from "@/components/ui/separator";

const RobotsList = ({card_id}: { card_id: ParamValue }) => {
    const {robots, setRobots} = useRobotsStore()
    const [robot_number_value, setRobot_number_value] = useState("")
    const [filtered_data, setFiltered_data] = useState<IRobot[]>([])
    const [open, setOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState("")
    const [selectedType, setSelectedType] = useState("")
    const inputRef = useRef(null)

    // Get unique statuses and types for filters
    const uniqueStatuses = [...new Set(robots.map(r => r.status))]
    const uniqueTypes = [...new Set(robots.map(r => r.robot_type))]

    useEffect(() => {
        let filtered = robots

        // Filter by search term
        if (robot_number_value.length > 0) {
            filtered = filtered.filter((robot: IRobot) =>
                robot.robot_number.toString().toLowerCase().includes(robot_number_value.toLowerCase()) ||
                robot.robot_type.toLowerCase().includes(robot_number_value.toLowerCase()) ||
                robot.status.toLowerCase().includes(robot_number_value.toLowerCase())
            )
        }

        // Filter by status
        if (selectedStatus) {
            filtered = filtered.filter(robot => robot.status === selectedStatus)
        }

        // Filter by type
        if (selectedType) {
            filtered = filtered.filter(robot => robot.robot_type === selectedType)
        }

        setFiltered_data(filtered)
        setOpen(robot_number_value.length > 0 && filtered.length > 0)
    }, [robot_number_value, robots, selectedStatus, selectedType]);

    const clearFilters = () => {
        setRobot_number_value("")
        setSelectedStatus("")
        setSelectedType("")
        setOpen(false)
    }

    const hasActiveFilters = robot_number_value || selectedStatus || selectedType

    const displayedRobots = robot_number_value || selectedStatus || selectedType
        ? filtered_data
        : robots.slice(0, 20)

    return (
        <div className="space-y-4">
            {/* Export Button */}
            {/*<div className="flex justify-end">
                <Button variant="outline">
                    Export Excel
                </Button>
            </div>*/}

            {/* Search and Filter Section */}
            <div className="mt-4">
                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={robot_number_value}
                            onChange={(e) => setRobot_number_value(e.target.value)}
                            placeholder="Search by robot number, type, or status..."
                            className="pl-9 pr-9"
                        />
                        {robot_number_value && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                onClick={() => setRobot_number_value("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Status Filter */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    Status {selectedStatus && `: ${selectedStatus}`}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search status..." />
                                    <CommandList>
                                        <CommandEmpty>No status found.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => setSelectedStatus("")}
                                            >
                                                All Statuses
                                            </CommandItem>
                                            {uniqueStatuses.map((status) => (
                                                <CommandItem
                                                    key={status}
                                                    onSelect={() => setSelectedStatus(status)}
                                                >
                                                    {status.toUpperCase()}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Type Filter */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    Type {selectedType && `: ${selectedType}`}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search type..." />
                                    <CommandList>
                                        <CommandEmpty>No type found.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => setSelectedType("")}
                                            >
                                                All Types
                                            </CommandItem>
                                            {uniqueTypes.map((type) => (
                                                <CommandItem
                                                    key={type}
                                                    onSelect={() => setSelectedType(type)}
                                                >
                                                    {type}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={clearFilters}
                            >
                                Clear all
                            </Button>
                        )}

                        {/* Results count */}
                        <span className="text-sm text-muted-foreground ml-auto">
                            {hasActiveFilters
                                ? `${filtered_data.length} result${filtered_data.length !== 1 ? 's' : ''}`
                                : `${robots.length} total robots`
                            }
                        </span>
                    </div>

                </div>
            </div>

            {/* Quick Results Dropdown */}
            {open && robot_number_value && (
                <div className="">
                    <div className="text-sm font-medium px-2 py-1.5 text-muted-foreground">
                        Quick Results ({Math.min(5, filtered_data.length)})
                    </div>
                    <div className="space-y-1">
                        {filtered_data.slice(0, 5).map((item: IRobot, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {item.robot_type === "K50H"
                                        ?   <Image src={`/img/K50H_green.svg`} alt={`robot_img`} width={30} height={30} />
                                        :   <Image src={`/img/A42T_green.svg`} alt={`robot_img`} width={30} height={30} />
                                    }
                                    <div>
                                        <Link href={`/robot/${item.id}`} className="font-medium">{item.robot_number}</Link>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {dayjs(item.updated_at).format('HH:mm · MMM D, YYYY')}
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                    {item.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    {filtered_data.length > 5 && (
                        <div className="text-sm text-center text-muted-foreground py-2 mt-2">
                            +{filtered_data.length - 5} more results below
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div>
                <Separator className="my-4" />
                <Table>
                    <TableCaption>
                        {hasActiveFilters
                            ? `Filtered robots (${filtered_data.length} results)`
                            : 'A list of recent Robots'
                        }
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">N</TableHead>
                            <TableHead>Number</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Update Time</TableHead>
                            <TableHead>Create Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedRobots.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No robots found matching your filters
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayedRobots.map((robot, index) => (
                                <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell className="font-mono">
                                        <Link href={`/robot/${robot.id}`}>{robot.robot_number}</Link>
                                    </TableCell>
                                    <TableCell>{robot.robot_type}</TableCell>
                                    <TableCell>
                                        <Badge variant={robot.status === 'active' ? 'default' : 'secondary'}>
                                            {robot.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {dayjs(robot.updated_at).format('HH:mm · MMM D, YYYY')}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {dayjs(robot.created_at).format('HH:mm · MMM D, YYYY')}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default RobotsList;