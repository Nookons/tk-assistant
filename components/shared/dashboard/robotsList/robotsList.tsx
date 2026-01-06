'use client'
import React, {useEffect, useState, useRef} from 'react';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Search, X, Clock, ChevronDown, Drill} from "lucide-react";
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
import {Label} from "@/components/ui/label";

const RobotsList = ({card_id}: { card_id: ParamValue }) => {
    const {robots, setRobots} = useRobotsStore()
    const [robot_number_value, setRobot_number_value] = useState("")
    const [filtered_data, setFiltered_data] = useState<IRobot[]>([])
    const [selectedStatus, setSelectedStatus] = useState("")
    const [selectedType, setSelectedType] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const inputRef = useRef(null)

    // Ensure robots is always an array
    const safeRobots = robots || []

    // Get unique statuses and types for filters
    const uniqueStatuses = [...new Set(safeRobots.map(r => r.status))]
    const uniqueTypes = [...new Set(safeRobots.map(r => r.robot_type))]

    useEffect(() => {
        let filtered = safeRobots

        // Filter by search term with smart matching
        if (robot_number_value.length > 0) {
            const searchLower = robot_number_value.toLowerCase()

            filtered = filtered.filter((robot: IRobot) => {
                const robotNumber = robot.robot_number.toString().toLowerCase()
                const robotType = robot.robot_type.toLowerCase()
                const robotStatus = robot.status.toLowerCase()

                return robotNumber.includes(searchLower) ||
                    robotType.includes(searchLower) ||
                    robotStatus.includes(searchLower)
            })

            // Sort by relevance: exact match first, then starts with, then contains
            filtered.sort((a, b) => {
                const aNumber = a.robot_number.toString().toLowerCase()
                const bNumber = b.robot_number.toString().toLowerCase()

                // Exact match
                if (aNumber === searchLower && bNumber !== searchLower) return -1
                if (bNumber === searchLower && aNumber !== searchLower) return 1

                // Starts with
                if (aNumber.startsWith(searchLower) && !bNumber.startsWith(searchLower)) return -1
                if (bNumber.startsWith(searchLower) && !aNumber.startsWith(searchLower)) return 1

                // Length (shorter numbers are more relevant when searching for specific number)
                const aLen = aNumber.length
                const bLen = bNumber.length
                if (aLen !== bLen) return aLen - bLen

                // Alphabetical
                return aNumber.localeCompare(bNumber)
            })
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
    }, [robot_number_value, safeRobots, selectedStatus, selectedType]);

    const clearFilters = () => {
        setRobot_number_value("")
        setSelectedStatus("")
        setSelectedType("")
    }

    const hasActiveFilters = robot_number_value || selectedStatus || selectedType

    const displayedRobots = robot_number_value || selectedStatus || selectedType
        ? filtered_data
        : safeRobots.slice(0, 20)

    return (
        <div className="space-y-3 sm:space-y-4 mt-4">
            {robots &&
                <>
                    <Label className={`text-xl`}><Drill /> Robots waiting for repair: ({robots.filter(item => item.status === "离线 | Offline").length})</Label>
                    <div className={`flex items-center gap-2 flex-wrap`}>
                        {robots.filter(item => item.status === "离线 | Offline").map((robot, index) => (
                            <Link href={`/robot/${robot.id}`} key={index} className="flex gap-2 border border-red-500 items-center  bg-muted py-2 px-4 rounded-2xl">
                                {robot.robot_type === "K50H"
                                    ?
                                    <>
                                        {robot.status === "离线 | Offline"
                                            ? <Image src={`/img/K50H_red.svg`} alt={`robot_img`} width={30} height={30}/>
                                            : <Image src={`/img/K50H_green.svg`} alt={`robot_img`} width={30} height={30}/>
                                        }
                                    </>
                                    :
                                    <>
                                        {robot.status === "离线 | Offline"
                                            ? <Image src={`/img/A42T_red.svg`} alt={`robot_img`} width={30} height={30}/>
                                            : <Image src={`/img/A42T_Green.svg`} alt={`robot_img`} width={30} height={30}/>
                                        }
                                    </>
                                }
                                <div className="font-mono font-semibold">{robot.robot_number}</div>
                            </Link>
                        ))}
                    </div>
                </>
            }
            {/* Search and Filter Section */}
            <div className="space-y-3">
                {/* Search Input */}
                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        ref={inputRef}
                        value={robot_number_value}
                        onChange={(e) => setRobot_number_value(e.target.value)}
                        placeholder="Search robots..."
                        className="pl-9 pr-4 h-11 text-base"
                        type="search"
                    />
                    {/*{robot_number_value && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                            onClick={() => setRobot_number_value("")}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}*/}
                </div>

                {/* Filter Toggle Button (Mobile) */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filters
                        {(selectedStatus || selectedType) && (
                            <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 text-xs">
                                {(selectedStatus ? 1 : 0) + (selectedType ? 1 : 0)}
                            </Badge>
                        )}
                        <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </Button>

                    {/* Results count */}
                    <span className="text-sm text-muted-foreground">
                        {hasActiveFilters
                            ? `${filtered_data.length} result${filtered_data.length !== 1 ? 's' : ''}`
                            : `${safeRobots.length} robots`
                        }
                    </span>
                </div>

                {/* Filters Dropdown */}
                {showFilters && (
                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg border animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Status Filter */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 w-full justify-start">
                                        <span className="truncate">
                                            Status {selectedStatus && `: ${selectedStatus}`}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0" align="start">
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
                                    <Button variant="outline" size="sm" className="h-9 w-full justify-start">
                                        <span className="truncate">
                                            Type {selectedType && `: ${selectedType}`}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0" align="start">
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
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-full"
                                onClick={clearFilters}
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Active Filters Pills */}
                {hasActiveFilters && !showFilters && (
                    <div className="flex flex-wrap gap-2">
                        {selectedStatus && (
                            <Badge variant="secondary" className="gap-1 pl-2 pr-1">
                                Status: {selectedStatus}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => setSelectedStatus("")}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        )}
                        {selectedType && (
                            <Badge variant="secondary" className="gap-1 pl-2 pr-1">
                                Type: {selectedType}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => setSelectedType("")}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            <Separator />

            {/* Table - Desktop */}
            <div className="hidden md:block">
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
                                        <Link href={`/robot/${robot.id}`} className="hover:underline">
                                            {robot.robot_number}
                                        </Link>
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

            {/* Cards - Mobile */}
            <div className="md:hidden flex flex-col gap-2">
                {displayedRobots.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No robots found</p>
                    </div>
                ) : (
                    displayedRobots.slice(0, 20).map((robot, index) => (
                        <Link key={index} href={`/robot/${robot.id}`}>
                            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors active:scale-[0.98]">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {robot.robot_type === "K50H"
                                            ?
                                            <>
                                                {robot.status === "离线 | Offline"
                                                    ? <Image src={`/img/K50H_red.svg`} alt={`robot_img`} width={32} height={32} />
                                                    : <Image src={`/img/K50H_green.svg`} alt={`robot_img`} width={32} height={32} />
                                                }
                                            </>
                                            :
                                            <>
                                                {robot.status === "离线 | Offline"
                                                    ? <Image src={`/img/A42T_red.svg`} alt={`robot_img`} width={32} height={32} />
                                                    : <Image src={`/img/A42T_Green.svg`} alt={`robot_img`} width={32} height={32} />
                                                }
                                            </>
                                        }
                                        <div>
                                            <div className="font-mono font-semibold">{robot.robot_number}</div>
                                            <div className="text-sm text-muted-foreground">{robot.robot_type}</div>
                                        </div>
                                    </div>
                                    <Badge variant={`secondary`} className={`py-1 px-4 border ${robot.status === '在线 | Online' ? 'border-green-500' : 'border-red-500'}`}>
                                        {robot.status}
                                    </Badge>
                                </div>
                               <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Updated: {dayjs(robot.updated_at).format('MMM D, YYYY HH:mm')}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default RobotsList;