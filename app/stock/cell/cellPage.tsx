'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import { useStockStore } from "@/store/stock";
import { LocationItem, LocationStock } from "@/types/stock/SummaryItem";
import Link from "next/link";
import Image from "next/image";

function StockItemCard({ item, index }: { item: LocationItem; index: number }) {
    const [imgError, setImgError] = useState(false);

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
            className="group relative  border border-white/8 rounded-xl overflow-hidden transition-all duration-200"
            style={{ animationDelay: `${index * 40}ms` }}
        >
            {/* Photo */}
            <div className="relative w-full aspect-square border-b border-white/8 overflow-hidden">
                {item.avatar_url && !imgError ? (
                    <Image
                        src={item.avatar_url}
                        alt={item.description_eng}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="2" y="2" width="20" height="20" rx="3"/>
                            <path d="M9 9h.01M15 15l-5-5 3-3 3 3 2-2 2 2"/>
                        </svg>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 relative">
                <div className={`absolute top-2 right-2 flex items-center justify-center min-w-8 h-7 px-2 rounded-md text-sm font-bold ${statusStyles.badge}`}>
                    {item.total_quantity}
                </div>

                <p className="text-xs text-muted-foreground uppercase tracking-widest leading-none mb-1 truncate">
                    {item.material_number}
                </p>
                <p className="text-xs font-medium leading-snug transition-colors line-clamp-2 mt-2">
                    {item.description_eng}
                </p>

                {/* Stock bar */}
                <div className="mt-3">
                    <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${statusStyles.bar}`}
                            style={{ width: `${Math.min((item.total_quantity / 15) * 100, 100)}%` }}
                        />
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
            <div className="border-b backdrop-blur-sm border-white/10 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <Link href="/" className="text-xs text-white/40 hover:text-white/70 uppercase tracking-widest transition-colors">
                        ← Back
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
                        <span><span className="text-white/70 font-bold">{uniqueParts}</span> SKUs</span>
                        <span><span className="text-white/70 font-bold">{totalItems}</span> Units</span>
                    </div>
                </div>
            </div>

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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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