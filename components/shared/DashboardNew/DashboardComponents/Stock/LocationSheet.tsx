import React from 'react';
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {ArrowRightLeft, Container, ExternalLink, HandCoins, Trash2, Warehouse} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {LocationItem, LocationStock} from "@/types/stock/SummaryItem";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import Image from "next/image";
import {MaterialImage} from "@/components/shared/DashboardNew/DashboardComponents/Stock/MaterialImage";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {StockService} from "@/services/stockService";
import {toast} from "sonner";
import MoveItemDialog from "@/components/shared/DashboardNew/DashboardComponents/Stock/MoveItemDialog";
import {useUserStore} from "@/store/user";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

const LocationSheet = ({el, onClose, onUpdate, stockData}: {
    el: LocationStock | null;
    onClose: () => void;
    onUpdate: (locationKey: string, newItems: LocationItem[]) => void;
    stockData: LocationStock[];
}) => {
    if (!el) return null;

    const [movingAll, setMovingAll] = React.useState(false);
    const [moveAllOpen, setMoveAllOpen] = React.useState(false);
    const [newLocationAll, setNewLocationAll] = React.useState('');
    const user = useUserStore(state => state.currentUser);



    const visibleItems = el.items.filter(i => i.total_quantity > 0);
    const locationLabel = el.location.split('-').pop()?.toUpperCase() ?? el.location;
    const warehouseName = el.items[0]?.warehouse ?? '';

    const deleteHandle = async (item: LocationItem) => {
        try {
            const result = await StockService.removeFromStock(item)

            if (result) {
                toast.success('Item removed successfully.');
                const newItems = el.items.filter(i => i.material_number !== item.material_number);
                onUpdate(el.location, newItems);
            }

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Sheet open={!!el} onOpenChange={open => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-[40vw] flex flex-col gap-0 p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                            <Container size={16} className="text-muted-foreground"/>
                        </div>
                        <div>
                            <SheetTitle className="text-base">{locationLabel}</SheetTitle>
                            <SheetDescription className="flex items-center gap-1 mt-0.5">
                                <Warehouse size={11}/>
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
                                <TableHead className="text-xs text-right w-[125px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleItems.map(item => (
                                <TableRow key={item.material_number}>
                                    <TableCell
                                        className="text-xs max-w-[100px] font-mono text-muted-foreground py-2.5 align-top">
                                        <HoverCard openDelay={10} closeDelay={100}>
                                            <HoverCardTrigger asChild>
                                                <div className={`pt-2`}>
                                                    <Link
                                                        className="text-blue-500 hover:underline font-medium"
                                                        href={`/stock-item/${item.material_number}`}
                                                    >
                                                        {item.material_number}
                                                    </Link>
                                                </div>
                                            </HoverCardTrigger>
                                            <HoverCardContent side={`left`} className="p-0 w-56 overflow-hidden rounded-xl border shadow-md">
                                                <MaterialImage url={item.avatar_url} alt={item.material_number} />
                                            </HoverCardContent>
                                        </HoverCard>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground/80 py-2.5 max-w-[180px]">
                                        <p className={`line-clamp-1`}>{item.description_eng ?? '—'}</p>
                                    </TableCell>
                                    <TableCell className="py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span
                                                className="text-sm font-semibold tabular-nums">{item.total_quantity}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">

                                        <MoveItemDialog
                                            el={el}
                                            item={item}
                                            onClose={onClose}
                                            onUpdate={onUpdate}
                                            stockData={stockData}   // ← прокидываем
                                        />

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size={`sm`} variant={`ghost`}>
                                                    <Trash2 size={16}/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete this items from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteHandle(item)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                    <div className={`flex items-center justify-end gap-2`}>
                        <Dialog open={moveAllOpen} onOpenChange={setMoveAllOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                    <ArrowRightLeft size={12} />
                                    Move All
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm">
                                <DialogHeader>
                                    <DialogTitle>Move Entire Location</DialogTitle>
                                    <DialogDescription>
                                        All <strong>{visibleItems.length}</strong> items from{' '}
                                        <strong>{locationLabel}</strong> will be moved.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-2">
                                    <Label htmlFor="move_all_location">New Location</Label>
                                    <Input
                                        id="move_all_location"
                                        value={newLocationAll}
                                        onChange={e => setNewLocationAll(e.target.value)}
                                        placeholder="e.g. B456"
                                        disabled={movingAll}
                                        className="mt-1.5"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setMoveAllOpen(false)}
                                        disabled={movingAll}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={movingAll || !newLocationAll.trim()}
                                    >
                                        {movingAll ? 'Moving...' : `Move ${visibleItems.length} items`}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                            <Link href={`/stock/cell?location=${el.location}&warehouse=${warehouseName}`}>
                                <ExternalLink size={12}/>
                                Open full page
                            </Link>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default LocationSheet;