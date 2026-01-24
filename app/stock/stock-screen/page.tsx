'use client'
import React from 'react';
import {useQuery} from "@tanstack/react-query";
import {getAllStockHistory} from "@/futures/stock/getAllStockHistory";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {timeToString} from "@/utils/timeToString";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {getStockSummary} from "@/futures/stock/getStockSummary";
import SummaryScreen from "@/components/shared/Stock/SummaryScreen";

const Page = () => {

    const {data: IStockHistory, isLoading, isError} = useQuery({
        queryKey: ['stockHistory-full'],
        queryFn: async () => getAllStockHistory(),
        retry: 3
    })


    const removeRecord = async (el: IHistoryStockItem) => {
        try {
            const response = await fetch(`/api/stock/remove-item`, {
                method: 'DELETE',  // ✅ Изменено с POST на DELETE
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    id: el.id,
                    value: el.value,
                    warehouse: el.warehouse,
                    material_number: el.material_number,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to remove record:', error);
            throw error;
        }
    }


    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error...</div>;
    if (!IStockHistory) return <div>Error...</div>;

    return (
        <div className={`max-w-[1200px] m-auto p-4`}>
            <div>
                <SummaryScreen />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Material Number</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Employee</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {IStockHistory.slice(0, 25).map((el) => (
                        <TableRow key={el.id}>
                            <TableCell className="font-medium">{el.warehouse}</TableCell>
                            <TableCell className="font-medium">{el.material_number}</TableCell>
                            <TableCell className="font-medium">{timeToString(dayjs(el.created_at).valueOf())}</TableCell>
                            <TableCell className="font-medium">{el.value}</TableCell>
                            <TableCell className="font-medium">{el.user.user_name}</TableCell>
                            <TableCell className="font-medium">
                                <Button onClick={() => removeRecord(el)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default Page;