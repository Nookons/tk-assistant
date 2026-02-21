import React, {useEffect, useState} from 'react';
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
import {MoreHorizontalIcon} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Progress} from "@/components/ui/progress";
import Link from "next/link";
import {Input} from "@/components/ui/input";

const EmployeesDisplay = () => {
    const {data, isLoading, isError} = useQuery({
        queryKey: ['employees_display'],
        queryFn: () => getEmployeesList(),
        retry: 1
    })

    if (isLoading) return (
        <div>Loading...</div>
    )

    if (!data) return null;

    return (
        <div>
            <Table>
                <TableBody>
                    {data.map((employee, index) => {

                        return (
                            <TableRow>
                                <TableCell className="font-medium">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={employee.avatar_url}/>
                                        <AvatarFallback
                                            className="text-xs bg-primary text-primary-foreground">{employee.user_name.toUpperCase().slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <Link className={`hover:underline`} href={`/user/${employee.auth_id}`}>
                                        {employee.user_name}
                                    </Link>
                                </TableCell>
                                <TableCell className="font-medium">{employee.warehouse}</TableCell>
                                <TableCell className="font-medium">{employee.email || ''}</TableCell>
                                <TableCell className="font-medium min-w-[75px]"><Progress value={employee.score || 0}/></TableCell>
                                <TableCell className="font-medium text-right whitespace-nowrap">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-8">
                                                <MoreHorizontalIcon/>
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem variant="destructive">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default EmployeesDisplay;