'use client'
import React, {useEffect} from 'react';
import {useQuery} from "@tanstack/react-query";
import {getAllStockHistory} from "@/futures/stock/getAllStockHistory";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {timeToString} from "@/utils/timeToString";
import dayjs from "dayjs";

const Page = () => {

    const {data: IStockHistory, isLoading, isError} = useQuery({
        queryKey: ['stockHistory-full'],
        queryFn: async () => getAllStockHistory(),
        retry: 3
    })

    useEffect(() => {
        console.log(IStockHistory);
    }, [IStockHistory])

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error...</div>;
    if (!IStockHistory) return <div>Error...</div>;

    return (
        <div className={`max-w-[1200px] m-auto p-4`}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Material Number</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Employee</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {IStockHistory.slice(0, 25).map((el) => (
                        <TableRow key={el.id}>
                            <TableCell className="font-medium">{el.material_number}</TableCell>
                            <TableCell className="font-medium">{timeToString(dayjs(el.created_at).valueOf())}</TableCell>
                            <TableCell className="font-medium">{el.value}</TableCell>
                            <TableCell className="font-medium">{el.user.user_name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default Page;