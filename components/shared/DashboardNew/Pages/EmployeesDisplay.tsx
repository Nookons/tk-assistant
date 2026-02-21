import React, {useState, useMemo} from 'react';
import {useQuery} from "@tanstack/react-query";
import {getEmployeesList} from "@/futures/user/getEmployees";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {MoreHorizontalIcon, Search, Users, Trophy, Warehouse, Star} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Progress} from "@/components/ui/progress";
import Link from "next/link";
import {Input} from "@/components/ui/input";
import {getUserWarehouse} from "@/utils/getUserWarehouse";
import {ScoreBar} from "@/components/shared/DashboardNew/DashboardComponents/Settings/ScoreBar";
import {getScoreRank} from "@/components/shared/DashboardNew/DashboardComponents/Settings/getScoreRank";

const ScoreBadge = ({score}: { score: number }) => {
    if (score >= 80) return <Badge
        className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Top</Badge>;
    if (score >= 50) return <Badge className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">Mid</Badge>;
    return <Badge variant="outline" className="text-xs text-muted-foreground">New</Badge>;
};

const EmployeesDisplay = () => {
    const [search, setSearch] = useState("");

    const {data, isLoading} = useQuery({
        queryKey: ['employees_display'],
        queryFn: () => getEmployeesList(),
        retry: 1,
    });

    const filtered = useMemo(() => {
        if (!data) return [];

        const q = search.trim().toLowerCase();
        if (!q) return data;

        return data.filter(e =>
            e.user_name.toLowerCase().includes(q) ||
            e.card_id.toString().includes(q) ||
            getUserWarehouse(e.warehouse)?.toLowerCase().includes(q) ||
            e.email?.toLowerCase().includes(q)
        );

    }, [data, search]);

    // Stats
    const totalEmployees = filtered?.length ?? 0;
    const warehouses = filtered ? new Set(filtered.map(e => getUserWarehouse(e.warehouse)).filter(Boolean)).size : 0;

    const avgScore = filtered?.length
        ? Math.round(filtered.reduce((s, e) => s + (e.score || 0), 0) / filtered.length)
        : 0;

    return (
        <div className="space-y-4">

            {/* Stats row */}
            <div className="grid md:grid-cols-3 gap-3">
                {[
                    {icon: Users, label: "Total Employees", value: isLoading ? "—" : totalEmployees},
                    {icon: Warehouse, label: "Warehouses", value: isLoading ? "—" : warehouses},
                    {icon: Trophy, label: "Avg Score", value: isLoading ? "—" : `${avgScore}%`},
                ].map(({icon: Icon, label, value}) => (
                    <div key={label} className="rounded-lg border bg-card px-4 py-3 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted shrink-0">
                            <Icon size={15} className="text-muted-foreground"/>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className="text-lg font-bold leading-none mt-0.5">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input
                    className="pl-9"
                    placeholder="Search by name, warehouse, email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs w-10"></TableHead>
                            <TableHead className="text-xs">Employee</TableHead>
                            <TableHead className="text-xs">Card ID</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Warehouse</TableHead>
                            <TableHead className="text-xs hidden md:table-cell">Email</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Score</TableHead>
                            <TableHead className="text-xs w-10"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({length: 6}).map((_, j) => (
                                    <TableCell key={j}>
                                        <div className="h-4 rounded bg-muted animate-pulse w-full max-w-[120px]"/>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}

                        {!isLoading && filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                    <Users size={24} className="mx-auto mb-2 opacity-30"/>
                                    No employees found
                                </TableCell>
                            </TableRow>
                        )}

                        {filtered.map((employee) => {

                            return (
                                <TableRow key={employee.auth_id}>
                                    <TableCell>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={employee.avatar_url}/>
                                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                                {employee.user_name.toUpperCase().slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/user/${employee.auth_id}`}
                                                className="text-sm font-medium hover:underline hover:text-primary transition-colors"
                                            >
                                                {employee.user_name}
                                            </Link>
                                            <ScoreBadge score={employee.score || 0}/>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/user/${employee.auth_id}`}
                                                className="text-sm font-medium hover:underline hover:text-primary transition-colors"
                                            >
                                                {employee.card_id}
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {employee.warehouse
                                            ? <Badge variant="outline"
                                                     className="text-xs font-mono">{employee.warehouse}</Badge>
                                            : <span className="text-xs text-muted-foreground/40">—</span>
                                        }
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                                        {employee.email || <span className="text-muted-foreground/40">—</span>}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <ScoreBar score={employee.score}/>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <MoreHorizontalIcon size={15}/>
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/user/${employee.auth_id}`}>View Profile</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Footer count */}
            {!isLoading && data && (
                <p className="text-xs text-muted-foreground text-right">
                    {filtered.length} of {totalEmployees} employees
                </p>
            )}
        </div>
    );
};

export default EmployeesDisplay;