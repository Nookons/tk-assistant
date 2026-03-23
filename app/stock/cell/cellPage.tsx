'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import { useStockStore } from "@/store/stock";
import { LocationItem, LocationStock } from "@/types/stock/SummaryItem";
import Link from "next/link";
import StockPartImage from "@/components/shared/StockPart/StockPartImage";
import PagesHeader from "@/components/shared/PagesHeader";
import {ButtonGroup} from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {ArrowLeftIcon, ArrowLeftRight, Trash2} from "lucide-react";

function StockItemCard({ item, index }: { item: LocationItem; index: number }) {
    const stockStatus =
        item.total_quantity >= 10 ? 'in_stock' :
            item.total_quantity >= 5  ? 'limited'  : 'low';

    const statusStyles = {
        in_stock: { badge: 'text-emerald-400', bar: 'bg-emerald-400', label: 'IN STOCK' },
        limited:  { badge: 'text-amber-400',  bar: 'bg-amber-400',  label: 'LIMITED'  },
        low:      { badge: 'text-red-400',     bar: 'bg-red-400',    label: 'LOW'      },
    }[stockStatus];

    return (
        <div
            className="group relative overflow-hidden transition-all duration-200"
            style={{ animationDelay: `${index * 40}ms` }}
        >
            <div className={`relative`}>
                <StockPartImage avatar_url={item.avatar_url}/>
            </div>

            <div className={`absolute top-2 backdrop-blur-3xl bg-background/50  right-2 flex items-center justify-center min-w-8 h-7 px-2 rounded-md text-sm font-bold`}>
                {item.total_quantity}
            </div>

            <div className="absolute flex justify-start items-end z-99 py-2 top-0 left-0 backdrop-blur-xs right-0 bottom-0 bg-background/50 opacity-0 group-hover:opacity-100">
                <div className={`w-full`}>

                    <div className={`absolute backdrop-blur-3xl bg-background/50 top-2 right-2 flex items-center justify-center min-w-8 h-7 px-2 rounded-md text-sm font-bold ${statusStyles.badge}`}>
                        {item.total_quantity}
                    </div>

                    <div className={`px-2`}>
                        <Link href={`#`} className="text-xs hover:underline hover:text-foreground text-muted-foreground uppercase tracking-widest leading-none mb-1 truncate">
                            {item.material_number}
                        </Link>
                        <p className="text-md font-medium leading-snug transition-colors line-clamp-2 mt-2">
                            {item.description_eng}
                        </p>
                    </div>

                    <div className={`p-2`}>
                        <ButtonGroup>
                            <ButtonGroup>
                                <Button variant="outline"><ArrowLeftRight /> Move</Button>
                                <Button variant="destructive"><Trash2 /> Remove</Button>
                            </ButtonGroup>
                        </ButtonGroup>
                    </div>

                    <div className="mt-3">
                        <div className="h-1 bg-white/5 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${statusStyles.bar}`}
                                style={{ width: `${Math.min((item.total_quantity / 15) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


const CellPage = () => {
    const searchParams = useSearchParams();
    const location  = searchParams.get('location');
    const warehouse = searchParams.get('warehouse');

    const stock_summary = useStockStore(state => state.stock_summary);
    const [cell_data, setCell_data] = useState<LocationStock | null>(null);

    useEffect(() => {
        if (stock_summary) {
            const found = stock_summary.find(item => item.location === location);
            setCell_data(found ?? null);
        }
    }, [stock_summary, location]);

    const totalItems  = cell_data?.items.reduce((acc, i) => acc + i.total_quantity, 0) ?? 0;
    const uniqueParts = cell_data?.items.length ?? 0;

    return (
        <div className="min-h-screen backdrop-blur-md">
            <PagesHeader />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {!cell_data ? (
                    <div className="flex flex-col items-center justify-center py-24 text-white/20">
                        <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        <p className="text-sm uppercase tracking-widest">No data for this location</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                        {cell_data.items.map((item, index) => (
                            <StockItemCard key={item.material_number} item={item} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CellPage;