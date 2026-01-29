'use client'
import React, {useEffect, useState} from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllStockHistory } from "@/futures/stock/getAllStockHistory";
import { IHistoryStockItem } from "@/types/stock/HistoryStock";
import { toast } from "sonner";
import { useUserStore } from "@/store/user";
import {getLocationsSummary} from "@/futures/stock/getLocationsSummary";
import {Item} from "@/components/ui/item";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import {StockByLocationResponse} from "@/types/stock/SummaryItem";
import {Badge} from "@/components/ui/badge";
import SummaryScreen from "@/components/shared/Stock/SummaryScreen";

const Page = () => {
    const user_store = useUserStore(state => state.current_user);
    const queryClient = useQueryClient();
    const [isLoadingR, setIsLoadingR] = useState<boolean>(false);


    const [search_value, setSearch_value] = useState<string>('')
    const [filtered_data, setFiltered_data] = useState<StockByLocationResponse>([])

    const { data: IStockHistory } = useQuery({
        queryKey: ['stockHistory-full'],
        queryFn: async () => getAllStockHistory(),
        retry: 3
    });

    const { data: LocationsSummary, isLoading, isError } = useQuery({
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
                <SummaryScreen />
            </div>
            <div className={`mt-4`}>
                <Input
                    value={search_value}
                    onChange={(e) => setSearch_value(e.target.value)}
                    placeholder={`A123`}
                />
            </div>
            <div className={`flex flex-wrap flex-col gap-2 mt-4`}>
                <p className={`text-muted-foreground text-xs`}>Recent locations: ({filtered_data.slice(0, 20).length})</p>
                {LocationsSummary && filtered_data.slice(0, 20).map((el) => (
                    <div className={`border p-2 rounded-2xl flex flex-col gap-2`}>
                        <div className={`flex items-center justify-between gap-2`}>
                            <article className={`text-xl font-bold`}>{el.location}</article>
                            <Badge className={`text-xs font-bold`}>{el.items[0].warehouse}</Badge>
                        </div>
                        <div className={`flex flex-wrap gap-2`}>
                            {el.items.map(part => (
                                <Item variant={`muted`}>
                                    <p>{part.material_number}</p>
                                    <Separator orientation={'vertical'}/>
                                    <p>{part.description_eng}</p>
                                    <Separator orientation={'vertical'}/>
                                    <p className={`font-bold`}>{part.total_quantity}</p>
                                </Item>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {/*<Table>
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
            </Table>*/}
        </div>
    );
};

export default Page;