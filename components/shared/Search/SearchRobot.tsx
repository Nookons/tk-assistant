'use client';

import React, {useEffect, useState} from 'react';
import {IRobot} from '@/types/robot/robot';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import dayjs from 'dayjs';
import {Frown, Search} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {ButtonGroup} from "@/components/ui/button-group";

interface Props {
    robots_data: IRobot[];
}

const SearchRobot: React.FC<Props> = ({robots_data}) => {
    const [search_value, setSearch_value] = useState('');
    const [filtered_data, setFiltered_data] = useState<IRobot[]>([]);

    useEffect(() => {
        let filtered = [...robots_data];
        if (search_value.length > 0) {
            const q = search_value.toLowerCase();
            filtered = filtered.filter((r) =>
                r.robot_number.toString().toLowerCase().includes(q) ||
                r.robot_type.toLowerCase().includes(q) ||
                r.status.toLowerCase().includes(q)
            );
            filtered.sort((a, b) => {
                const an = a.robot_number.toString().toLowerCase();
                const bn = b.robot_number.toString().toLowerCase();
                if (an === q && bn !== q) return -1;
                if (bn === q && an !== q) return 1;
                if (an.startsWith(q) && !bn.startsWith(q)) return -1;
                if (bn.startsWith(q) && !an.startsWith(q)) return 1;
                if (an.length !== bn.length) return an.length - bn.length;
                return an.localeCompare(bn);
            });
        }
        setFiltered_data(filtered.slice(0, 25));
    }, [search_value, robots_data]);

    return (
        <div className="p-2 backdrop-blur-sm rounded-md">
            <div className="mb-2 flex flex-col gap-1">
                <p className="text-sm mt-1">
                    {robots_data.length} units registered ·{' '}
                    {robots_data.filter((r) => r.status.toUpperCase() === '在线 | ONLINE').length} online
                </p>
            </div>

            {/* ─── Toolbar ─── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-2">
                <div className="relative flex-1">
                    <div
                        className={`absolute z-50 top-1/2 transform -translate-y-1/2 left-2 ${search_value.length > 0 ? 'text-slate-500' : 'text-slate-400'}`}>
                        <Search size={16}/>
                    </div>
                    <Input
                        value={search_value}
                        onChange={(e) => setSearch_value(e.target.value)}
                        placeholder="Search by number, type, status…"
                        className="w-full pl-9"
                    />
                    {search_value && (
                        <button
                            onClick={() => setSearch_value('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <ButtonGroup>
                    <Button
                        className={`flex items-center gap-2`}
                    >
                        <span className="text-lg leading-none">+</span>
                        <span>Robot</span>
                    </Button>
                </ButtonGroup>
            </div>

            {/* ─── Table container ─── */}
            <div className="overflow-x-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Number</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Warehouse</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Update Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered_data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                    <div className={`flex items-center gap-2 justify-center`}>
                                        <Frown/> No robots found matching your filters
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered_data.map((robot, index) => (
                                <TableRow key={index}
                                          className={`transition-colors ${search_value === robot.robot_number.toString() && "bg-gradient-to-l from-background to-lime-500/25"}`}>
                                    <TableCell className="font-mono">
                                        <Link href={`/robot/${robot.id}`} className="hover:underline">
                                            {robot.robot_number}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{robot.robot_type}</TableCell>
                                    <TableCell>{robot.warehouse}</TableCell>
                                    <TableCell>
                                        <Badge variant={robot.status === 'active' ? 'default' : 'secondary'}>
                                            {robot.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {dayjs(robot.updated_at).format('HH:mm · MMM D, YYYY')}
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

export default SearchRobot;