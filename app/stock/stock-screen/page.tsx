'use client'
import React, { useState } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllStockHistory } from "@/futures/stock/getAllStockHistory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { timeToString } from "@/utils/timeToString";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { IHistoryStockItem } from "@/types/stock/HistoryStock";
import SummaryScreen from "@/components/shared/Stock/SummaryScreen";
import { toast } from "sonner";
import { ButtonGroup } from "@/components/ui/button-group";
import { Pencil, Trash2 } from "lucide-react";
import { useUserStore } from "@/store/user";

const Page = () => {
    const user_store = useUserStore(state => state.current_user);
    const queryClient = useQueryClient();
    const [isLoadingR, setIsLoadingR] = useState<boolean>(false);

    const { data: IStockHistory, isLoading, isError } = useQuery({
        queryKey: ['stockHistory-full'],
        queryFn: async () => getAllStockHistory(),
        retry: 3
    });

    const removeRecord = async (el: IHistoryStockItem) => {
        if (!user_store) {
            toast.error('User not authenticated');
            return;
        }

        try {
            setIsLoadingR(true);

            const [removeResponse, usePartResponse] = await Promise.all([
                fetch(`/api/stock/remove-item`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: el.id,
                        value: el.value,
                        warehouse: el.warehouse,
                        material_number: el.material_number,
                        location: el.location,
                    }),
                }),
                fetch(`/api/stock/use-part`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        warehouse: el.warehouse,
                        location: el.location,
                        material_number: el.material_number,
                        card_id: user_store.card_id,
                        value: el.value,
                    })
                })
            ]);

            if (!removeResponse.ok || !usePartResponse.ok) {
                throw new Error('Failed to remove record');
            }

            toast.success('Record removed successfully');
            await queryClient.invalidateQueries({ queryKey: ['stockHistory-full'] });
        } catch (error) {
            console.error('Failed to remove record:', error);
            toast.error('Failed to remove record');
        } finally {
            setIsLoadingR(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading stock history</div>;
    if (!IStockHistory) return <div>No data available</div>;

    return (
        <div className="max-w-[1200px] m-auto p-4">
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
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {IStockHistory
                        .sort((a, b) => {
                            const dateA = dayjs(a.created_at).valueOf();
                            const dateB = dayjs(b.created_at).valueOf();
                            return dateB - dateA; // новые сверху
                        })
                        .slice(0, 25)
                        .map((el) => (
                            <TableRow key={el.id}>
                                <TableCell className="font-medium">{el.warehouse}</TableCell>
                                <TableCell className="font-medium">{el.material_number}</TableCell>
                                <TableCell className="font-medium">{timeToString(dayjs(el.created_at).valueOf())}</TableCell>
                                <TableCell className="font-medium">{el.value}</TableCell>
                                <TableCell className="font-medium">{el.user.user_name}</TableCell>
                                <TableCell className="flex justify-end">
                                    <ButtonGroup>
                                        <Button variant="secondary" onClick={() => toast.warning("Doesn't work right now")}>
                                            <Pencil />
                                        </Button>
                                        <Button variant="secondary" disabled={isLoadingR} onClick={() => removeRecord(el)}>
                                            <Trash2 />
                                        </Button>
                                    </ButtonGroup>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default Page;