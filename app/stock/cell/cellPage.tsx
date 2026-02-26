'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import { useStockStore } from "@/store/stock";
import { LocationStock } from "@/types/stock/SummaryItem";
import {Button} from "@/components/ui/button";
import Link from "next/link";

const CellPage = () => {
    const searchParams = useSearchParams();

    const location = searchParams.get('location');
    const warehouse = searchParams.get('warehouse');

    const stock_summary = useStockStore(state => state.stock_summary);

    const [cell_data, setCell_data] = useState<LocationStock | null>(null);

    useEffect(() => {
        if (stock_summary) {
            const find_result = stock_summary.find(item => item.location === location);
            if (find_result) {
                setCell_data(find_result);
            }
        }
    }, [stock_summary, warehouse, location]);

    const totalItems = cell_data?.items.reduce((acc, item) => acc + item.total_quantity, 0) ?? 0;
    const uniqueParts = cell_data?.items.length ?? 0;

    return (
        <div className="min-h-screen font-mono">

            {/* Header */}
            <div className="border-b backdrop-blur-sm border-white/10 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <Link href={'/'}>
                        Back
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-white/40 uppercase tracking-widest">
                            {warehouse ?? 'Warehouse'}
                        </span>
                        <span className="text-white/20">/</span>
                        <span className="text-sm text-white/80 uppercase tracking-widest font-bold">
                            {location ?? '—'}
                        </span>
                    </div>
                    <div className="flex gap-6 text-xs text-white/40">
                        <span>
                            <span className="text-white/70 font-bold">{uniqueParts}</span> SKUs
                        </span>
                        <span>
                            <span className="text-white/70 font-bold">{totalItems}</span> Total Units
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl backdrop-blur-sm mx-auto px-6 py-8">

                {/* Items Grid */}
                {!cell_data ? (
                    <div className="flex flex-col items-center justify-center py-24 text-white/20">
                        <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        <p className="text-sm uppercase tracking-widest">No data for this location</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {cell_data.items.map((item, index) => (
                            <div
                                key={item.material_number}
                                className="group relative bg-white/[0.03] border border-white/8 rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 cursor-default"
                                style={{ animationDelay: `${index * 40}ms` }}
                            >
                                {/* Quantity Badge */}
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest leading-none">
                                        {item.material_number}
                                    </span>
                                    <div className={`
                                        flex items-center justify-center min-w-[32px] h-7 px-2 rounded-md text-sm font-bold
                                        ${item.total_quantity >= 10
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        : item.total_quantity >= 5
                                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                            : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                    }
                                    `}>
                                        {item.total_quantity}
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-white/80 font-medium leading-snug mt-1 group-hover:text-white transition-colors">
                                    {item.description_eng}
                                </p>

                                {/* Stock Bar */}
                                <div className="mt-4">
                                    <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                item.total_quantity >= 10
                                                    ? 'bg-emerald-400'
                                                    : item.total_quantity >= 5
                                                        ? 'bg-amber-400'
                                                        : 'bg-red-400'
                                            }`}
                                            style={{
                                                width: `${Math.min((item.total_quantity / 15) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-1.5">
                                        <span className="text-[9px] text-white/20">
                                            {item.total_quantity >= 10 ? 'IN STOCK' : item.total_quantity >= 5 ? 'LIMITED' : 'LOW'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CellPage;