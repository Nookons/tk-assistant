'use client'
import React, {useEffect, useState} from 'react';
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getAllStockHistory} from "@/futures/stock/getAllStockHistory";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {toast} from "sonner";
import {useUserStore} from "@/store/user";
import {getLocationsSummary} from "@/futures/stock/getLocationsSummary";
import {Item} from "@/components/ui/item";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import {StockByLocationResponse} from "@/types/stock/SummaryItem";
import {Badge} from "@/components/ui/badge";
import SummaryScreen from "@/components/shared/Stock/SummaryScreen";
import Link from "next/link";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import dayjs from "dayjs";
import {timeToString} from "@/utils/timeToString";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {Pencil, Trash2} from "lucide-react";

const Page = () => {
    const user_store = useUserStore(state => state.current_user);
    const queryClient = useQueryClient();
    const [isLoadingR, setIsLoadingR] = useState<boolean>(false);


    const [search_value, setSearch_value] = useState<string>('')
    const [filtered_data, setFiltered_data] = useState<StockByLocationResponse>([])

    const {data: IStockHistory} = useQuery({
        queryKey: ['stockHistory-full'],
        queryFn: async () => getAllStockHistory(),
        retry: 3
    });

    const {data: LocationsSummary, isLoading, isError} = useQuery({
        queryKey: ['stockHistory-locations-full'],
        queryFn: async () => getLocationsSummary(),
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
                    headers: {'Content-Type': 'application/json'},
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
                    headers: {"Content-Type": "application/json"},
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
            await queryClient.invalidateQueries({queryKey: ['stockHistory-full']});
        } catch (error) {
            console.error('Failed to remove record:', error);
            toast.error('Failed to remove record');
        } finally {
            setIsLoadingR(false);
        }
    };

    useEffect(() => {
        if (LocationsSummary) {
            if (search_value.length > 0) {
                const filtered = LocationsSummary.filter(el => el.location.includes(search_value))
                setFiltered_data(filtered)
            } else {
                setFiltered_data(LocationsSummary)
            }
        }
    }, [search_value, LocationsSummary]);

    useEffect(() => {
        console.log(LocationsSummary);
    }, [LocationsSummary]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading stock history</div>;
    if (!IStockHistory) return <div>No data available</div>;

    return (
        <div className="max-w-[1200px] m-auto p-4">
            <div>
                <SummaryScreen/>
            </div>
            <div className={`mt-4`}>
                <Input
                    value={search_value}
                    onChange={(e) => setSearch_value(e.target.value)}
                    placeholder={`A123`}
                />
            </div>
            <p className="text-xs my-2  text-muted-foreground">
                Recent locations ({filtered_data.slice(0, 20).length})
            </p>
            <div className="flex flex-wrap items-start gap-2">
                {LocationsSummary &&
                    filtered_data.slice(0, 20).map((el) => (
                        <Link
                            href={`/stock/cell?location=${el.location}&warehouse=${el.items[0].warehouse}`}
                            key={el.location}
                            className="rounded-xl border bg-background p-3 hover:bg-muted"
                        >
                            {/* Header */}
                            <div className="mb-2 flex items-center justify-between">
                                  <span className="text-sm font-semibold">
                                    {el.location}
                                  </span>
                                <span className="text-xs text-muted-foreground">
                                    {el.items[0].warehouse}
                                  </span>
                            </div>

                            {/* Items */}
                            <div className="flex flex-col gap-1">
                                {el.items.map((part) => (
                                    <div
                                        key={part.material_number}
                                        className="flex items-center justify-between text-xs"
                                    >
                                      <span className="text-muted-foreground">
                                        {part.material_number}
                                      </span>
                                        <span className="line-clamp-1 flex-1 px-2">
                                        {part.description_eng}
                                      </span>
                                        <span className="font-medium">
                                            {part.total_quantity}
                                          </span>
                                    </div>
                                ))}
                            </div>
                        </Link>
                    ))}
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Material Number</TableHead>
                        <TableHead>Created</TableHead>
                        {/*<TableHead className="text-right">Actions</TableHead>*/}
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
                                <TableCell className="font-medium">{el.user.user_name}</TableCell>
                                <TableCell className="font-medium">{el.warehouse}</TableCell>
                                <TableCell className="font-medium">{el.location}</TableCell>
                                <TableCell className="font-medium">{el.value}</TableCell>
                                <TableCell className="font-medium">{el.material_number}</TableCell>
                                <TableCell className="font-medium">{timeToString(dayjs(el.created_at).valueOf())}</TableCell>
                                {/*<TableCell className="flex justify-end">
                                    <ButtonGroup>
                                        <Button variant="secondary" onClick={() => toast.warning("Doesn't work right now")}>
                                            <Pencil />
                                        </Button>
                                        <Button variant="secondary" disabled={isLoadingR} onClick={() => removeRecord(el)}>
                                            <Trash2 />
                                        </Button>
                                    </ButtonGroup>
                                </TableCell>*/}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default Page;