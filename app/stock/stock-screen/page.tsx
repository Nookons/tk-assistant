'use client'
import React, {useEffect, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import {Input} from "@/components/ui/input";
import {getLocationsSummary} from "@/futures/stock/getLocationsSummary";
import {LocationStock, StockByLocationResponse} from "@/types/stock/SummaryItem";
import Link from "next/link";
import {Container, HandCoins, Warehouse} from "lucide-react";
import SearchStockTemplate from "@/components/shared/Search/SearchStockTemplate";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card} from "@/components/ui/card";
import SummaryScreen from "@/components/shared/Stock/SummaryScreen";
import {Field, FieldLabel} from "@/components/ui/field";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";

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

        let data = [...LocationsSummary];

        // 🔹 фильтр по складу
        if (picked_warehouse !== 'all') {
            data = data.filter(location =>
                location.items?.some(
                    item =>
                        item.warehouse?.toUpperCase() ===
                        picked_warehouse.toUpperCase()
                )
            );
        }

        // 🔹 если пустой поиск
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

                if (locationMatch) {
                    return location;
                }

                if (filteredItems && filteredItems.length > 0) {
                    return {
                        ...location,
                        items: filteredItems
                    };
                }

                return null;
            })
            .filter((location): location is LocationStock => location !== null);

        setFiltered_data(filtered);

    }, [search_value, picked_warehouse, LocationsSummary]);


    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading stock history</div>;

    return (
        <div className="m-auto p-4 grid md:grid-cols-[1fr_550px] items-start gap-6">
            <div className={`backdrop-blur-sm p-2 rounded-md`}>
                <div className="hidden md:block">
                    <SummaryScreen/>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                    <Input
                        value={search_value}
                        onChange={(e) => setSearch_value(e.target.value)}
                        placeholder="Location number & material number & material description"
                    />

                    <div className={`flex justify-between flex-wrap items-start gap-4 mt-2`}>
                        <Tabs
                            value={picked_warehouse}
                            onValueChange={setPicked_warehouse}
                        >
                            <div className={`flex items-center gap-2 flex-wrap`}>
                                <TabsList>
                                    <TabsTrigger value="all">ALL</TabsTrigger>
                                    <TabsTrigger value="glpc">GLPC</TabsTrigger>
                                    <TabsTrigger value="small_p3">SMALL P3</TabsTrigger>
                                    <TabsTrigger value="pnt">PNT</TabsTrigger>
                                </TabsList>

                                <TabsContent value="all">
                                    <p className="px-2 text-xs text-red-500">
                                        Please give attention what right now you looking for on all warehouses
                                    </p>
                                </TabsContent>
                            </div>
                        </Tabs>

                        <div className="flex items-center w-full md:w-auto justify-between gap-4">
                            <Field orientation="horizontal" className="w-fit">
                                <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
                                <Select defaultValue="25">
                                    <SelectTrigger className="w-20" id="select-rows-per-page">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent align="start">
                                        <SelectGroup>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Pagination className="mx-0 w-auto">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href="#"/>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext href="#"/>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </div>

                <p className="text-xs my-2 text-muted-foreground">
                    Recent locations ({filtered_data.slice(0, 20).length})
                </p>

                <div className="grid md:grid-cols-3 gap-2">
                    {filtered_data.slice(0, 20).map((el) => {
                        let counter = 0;

                        for (const item of el.items) {
                            if (item.total_quantity > 0) counter++;
                        }

                        if (counter === 0) return null;

                        return (
                            <Link
                                href={`/stock/cell?location=${el.location}&warehouse=${el.items[0]?.warehouse ?? ''}`}
                                key={el.location}
                                className="rounded-xl border bg-background p-3 hover:bg-muted"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Container/>
                                        <span className="text-sm font-semibold">
                                            {el.location.split('-')[1].toUpperCase() ?? 'Unknown'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Warehouse/>
                                        <span className="text-xs text-muted-foreground">
                                            {el.items[0]?.warehouse}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    {el.items.slice(0, 5).map((part) => {
                                        if (!part || part.total_quantity === 0) return null;

                                        return (
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

                                                <div className={`flex items-center gap-2`}>
                                                    <span className="font-medium text-base">
                                                        {part.total_quantity}
                                                    </span>
                                                    <HandCoins size={16} />
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {el.items.length > 5 && (
                                        <p className="text-center text-xs mt-2 text-muted-foreground">
                                            and {el.items.length - 5} more
                                        </p>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div>
                <SearchStockTemplate/>
            </div>
        </div>
    );
};

export default Page;
