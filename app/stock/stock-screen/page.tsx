'use client'
import React, {useEffect, useState} from 'react';
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {toast} from "sonner";
import {useUserStore} from "@/store/user";
import {getLocationsSummary} from "@/futures/stock/getLocationsSummary";
import {Input} from "@/components/ui/input";
import {LocationStock, StockByLocationResponse} from "@/types/stock/SummaryItem";
import Link from "next/link";
import {Container, Warehouse} from "lucide-react";
import SearchStockTemplate from "@/components/shared/Search/SearchStockTemplate";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import SummaryScreen from "@/components/shared/Stock/SummaryScreen";

const Page = () => {
    const [search_value, setSearch_value] = useState<string>('')
    const [filtered_data, setFiltered_data] = useState<StockByLocationResponse>([])

    const [picked_warehouse, setPicked_warehouse] = useState<string>('all')

    const {data: LocationsSummary, isLoading, isError} = useQuery({
        queryKey: ['stockHistory-locations-full'],
        queryFn: async () => getLocationsSummary(),
        retry: 3
    });


    useEffect(() => {
        if (!LocationsSummary) return;
        console.log(LocationsSummary);

        let data = [...LocationsSummary];

        if (picked_warehouse !== 'all') {
            data = data.filter(location =>
                location.items?.some(
                    item => item.warehouse.toUpperCase() === picked_warehouse.toUpperCase()
                )
            );
        }

        if (search_value.trim().length === 0) {
            setFiltered_data(data);
            return;
        }

        const search = search_value.toUpperCase();

        const filtered = data
            .map(location => {
                const locationMatch =
                    location.location?.toUpperCase().includes(search);

                const filteredItems = location.items?.filter(item =>
                    item.material_number?.toUpperCase().includes(search) ||
                    item.description_eng?.toUpperCase().includes(search)
                );

                // Если совпала сама локация — вернуть всю локацию
                if (locationMatch) {
                    return location;
                }

                // Если совпали items — вернуть только их
                if (filteredItems?.length > 0) {
                    return {
                        ...location,
                        items: filteredItems
                    };
                }

                return null;
            })
            .filter((location): location is LocationStock => location !== null)

        setFiltered_data(filtered);

    }, [search_value, picked_warehouse, LocationsSummary]);



    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading stock history</div>;

    return (
        <div className="m-auto p-4 grid md:grid-cols-[1fr_550px] gap-6">
            <div>
                <div className={`hidden md:block`}>
                    <SummaryScreen/>
                </div>

                <div className={`flex flex-col gap-2 mt-4`}>
                    <Input
                        value={search_value}
                        onChange={(e) => setSearch_value(e.target.value)}
                        placeholder={`Location number & material number & material description`}
                    />
                    <div>
                        <Tabs value={picked_warehouse} onValueChange={(value) => setPicked_warehouse(value)} className="">
                            <TabsList>
                                <TabsTrigger value="all">ALL</TabsTrigger>
                                <TabsTrigger value="glpc">GLPC</TabsTrigger>
                                <TabsTrigger value="small_p3">SMALL P3</TabsTrigger>
                                <TabsTrigger value="pnt">PNT</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all">
                                <Card className={`p-2`}>
                                    <p className={`px-2 text-xs text-red-500`}>
                                        Please give attention what right now you looking for on all warehouses
                                    </p>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <p className="text-xs my-2  text-muted-foreground">
                    Recent locations ({filtered_data.slice(0, 20).length})
                </p>
                <div className="grid md:grid-cols-3 gap-2">
                    {LocationsSummary &&
                        filtered_data.slice(0, 20).map((el) => (
                            <Link
                                href={`/stock/cell?location=${el.location}&warehouse=${el.items[0].warehouse}`}
                                key={el.location}
                                className="rounded-xl border bg-background p-3 hover:bg-muted"
                            >
                                {/* Header */}
                                <div className="mb-2 flex items-center justify-between">
                                    <div className={`flex items-center gap-2`}>
                                        <Container/>
                                        <span className="text-sm font-semibold">
                                       {el.location}
                                    </span>
                                    </div>

                                    <div className={`flex items-center gap-2`}>
                                        <Warehouse/>
                                        <span className="text-xs text-muted-foreground">
                                        {el.items[0].warehouse}
                                    </span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="flex flex-col gap-1">
                                    {el.items.slice(0, 5).map((part) => (
                                        <div
                                            key={part.material_number}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="flex items-center justify-between text-xs">
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
                                        </div>
                                    ))}
                                    {el.items.length > 5 &&
                                        <p className={`text-center text-xs mt-4 text-muted-foreground`}>and {el.items.slice(5).length} more</p>
                                    }
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
            <div>
                <SearchStockTemplate/>
            </div>
        </div>
    );
};

export default Page;