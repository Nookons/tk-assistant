import React from 'react';
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Container, ExternalLink, HandCoins, Warehouse} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {LocationStock} from "@/types/stock/SummaryItem";

const LocationSheet = ({ el, onClose }: { el: LocationStock | null; onClose: () => void }) => {
    if (!el) return null;

    const visibleItems = el.items.filter(i => i.total_quantity > 0);
    const locationLabel = el.location.split('-')[1]?.toUpperCase() ?? el.location;
    const warehouseName = el.items[0]?.warehouse ?? '';

    return (
        <Sheet open={!!el} onOpenChange={open => !open && onClose()}>
            <SheetContent className="sm:max-w-[40vw] flex flex-col gap-0 p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                            <Container size={16} className="text-muted-foreground" />
                        </div>
                        <div>
                            <SheetTitle className="text-base">{locationLabel}</SheetTitle>
                            <SheetDescription className="flex items-center gap-1 mt-0.5">
                                <Warehouse size={11} />
                                {warehouseName} · {visibleItems.length} items
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-2 py-3">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs w-[110px]">Material</TableHead>
                                <TableHead className="text-xs">Description</TableHead>
                                <TableHead className="text-xs text-right w-[75px]">Qty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleItems.map(item => (
                                <TableRow key={item.material_number}>
                                    <TableCell className="text-xs max-w-[100px] font-mono text-muted-foreground py-2.5 align-top">
                                        <Link className={`text-blue-500 hover:underline font-medium`} href={`#`}>{item.material_number}</Link>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground/80 py-2.5 max-w-[180px]">
                                        <p className={`line-clamp-1`}>{item.description_eng ?? '—'}</p>
                                    </TableCell>
                                    <TableCell className="py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-sm font-semibold tabular-nums">{item.total_quantity}</span>
                                            <HandCoins size={11} className="text-muted-foreground/40" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        Total: <span className="font-semibold text-foreground">
                            {visibleItems.reduce((sum, i) => sum + i.total_quantity, 0).toLocaleString()}
                        </span> units
                    </span>
                    <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                        <Link href={`/stock/cell?location=${el.location}&warehouse=${warehouseName}`}>
                            <ExternalLink size={12} />
                            Open full page
                        </Link>
                    </Button>
                </div>

            </SheetContent>
        </Sheet>
    );
};

export default LocationSheet;