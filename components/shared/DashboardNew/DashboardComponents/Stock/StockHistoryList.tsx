import React, {useState} from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import {useMutation} from '@tanstack/react-query';
import {toast} from 'sonner';
import {
    Download, Loader2,
    Minus, Package, SquareArrowOutUpRight,
    Trash2, User
} from 'lucide-react';

import {useUserStore} from '@/store/user';
import {useStockStore} from '@/store/stock';
import {getUserWarehouse} from '@/utils/getUserWarehouse';
import {timeToString} from '@/utils/timeToString';
import {StockService} from '@/services/stockService';
import {IHistoryStockItem} from '@/types/stock/HistoryStock';
import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";

const SHOW_LIMIT_DEFAULT = 25;
const PAGE_SIZE = 50;

function QuantityCell({quantity}: { quantity: number }) {
    const isNegative = quantity < 0;
    return (
        <TableCell
            className={`text-sm font-semibold tabular-nums ${isNegative ? 'text-destructive' : 'text-emerald-500'}`}>
            {quantity > 0 ? `+${quantity.toLocaleString()}` : quantity.toLocaleString()}
        </TableCell>
    );
}

function LinkCell({href, label}: { href: string; label: string }) {
    return (
        <Link href={href} className="hover:underline text-blue-500 font-medium">
            {label}
        </Link>
    );
}

function EmptyRow({warehouse}: { warehouse: string }) {
    return (
        <TableRow>
            <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                <Package size={24} className="mx-auto mb-2 opacity-30"/>
                No entries yet for {warehouse}
            </TableCell>
        </TableRow>
    );
}


const StockHistoryList = ({isShort}: { isShort: boolean }) => {
    const user = useUserStore(state => state.currentUser);
    const warehouse = getUserWarehouse(user?.warehouse ?? '');

    const stock_history = useStockStore(state => state.stock_history);
    const addToHistory = useStockStore(state => state.add_item_to_history);

    const [showLimit, setShowLimit] = useState(SHOW_LIMIT_DEFAULT);
    const [page, setPage] = useState(1);

    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [isOnlyUsed, setIsOnlyUsed] = useState<boolean>(false)
    const [isOnlyToday, setIsOnlyToday] = useState<boolean>(false)

    const {mutate: handleDelete} = useMutation({
        mutationFn: async (item: IHistoryStockItem) => {
            const reversed = {...item, quantity: -item.quantity};
            const response = await StockService.addStockHistory(reversed);
            addToHistory(response);
            await StockService.addStockRecord(reversed);
        },
        onSuccess: () => toast.success('Item was successfully added to Stock'),
        onError: (err: Error) => toast.error(err.message),
    });

    if (!stock_history) return null;

    const isLeader = warehouse.toLowerCase() === 'leader';

    const sorted = [...stock_history]
        //.filter(item => isLeader ? true : item.warehouse === warehouse)
        .filter(item => isOnlyUsed ? item.quantity < 0 : true)
        .filter(item => isOnlyToday ? dayjs(item.created_at).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') : true)
        .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const paginated = isShort
        ? sorted.slice(0, showLimit)
        : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const onExport = async () => {

    }

    return (
        <div className="overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-center gap-2 p-2">
                <p className="px-2 py-2 text-xs font-medium text-muted-foreground">
                    Historical data for your current warehouse only.
                </p>
                <div className={`flex justify-end gap-2 items-center`}>
                    <div className="flex items-center space-x-2 mr-4">
                        <Switch
                            checked={isOnlyUsed}
                            onCheckedChange={(value) => { setIsOnlyUsed(value); setPage(1); }}
                            id="used-mode"
                        />
                        <Label htmlFor="used-mode">Used</Label>
                    </div>
                    <div className="flex items-center space-x-2 mr-4">
                        <Switch
                            checked={isOnlyToday}
                            onCheckedChange={(value) => { setIsOnlyToday(value); setPage(1); }}
                            id="today-mode"
                        />
                        <Label htmlFor="today-mode">Today</Label>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={onExport}
                        disabled={isExporting || paginated.length === 0}
                        className="gap-1.5 text-xs"
                        title="Export filtered data to Excel"
                    >
                        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    </Button>

                    {isShort &&
                        <div className="flex gap-1">
                            <Link href={`/stock/stock-history`}>
                                <Button variant="ghost" size="icon">
                                    <SquareArrowOutUpRight size={16}/>
                                </Button>
                            </Link>
                        </div>
                    }
                </div>
            </div>

            {!isShort && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                    <span className="text-xs text-muted-foreground">
                        Page {page} of {totalPages} · {sorted.length} entries
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}
                        >
                            ← Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === totalPages}
                        >
                            Next →
                        </Button>
                    </div>
                </div>
            )}

            <div className="overflow-auto flex-1 p-2">
                <ScrollArea className="h-[75dvh] md:h-[82dvh] w-full rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs">Employee</TableHead>
                                <TableHead className="text-xs hidden sm:table-cell">Warehouse</TableHead>
                                <TableHead className="text-xs hidden md:table-cell">Location</TableHead>
                                <TableHead className="text-xs">Qty</TableHead>
                                <TableHead className="text-xs">Material</TableHead>
                                <TableHead className="text-xs hidden sm:table-cell">Robot</TableHead>
                                <TableHead className="text-xs hidden sm:table-cell">Time</TableHead>
                                {/*<TableHead className="text-xs w-[80px]">Actions</TableHead>*/}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0
                                ? <EmptyRow warehouse={warehouse}/>
                                : paginated.map(el => (
                                    <TableRow key={el.id}>
                                        <TableCell className="text-sm font-medium">
                                            <span className="flex items-center gap-2">
                                                <User size={16}/>
                                                {el.user.user_name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium hidden sm:table-cell">
                                            <span className="flex items-center gap-2">
                                                {el.warehouse}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm font-mono hidden md:table-cell">
                                            {el.location
                                                ?
                                                <LinkCell
                                                    href={`/stock/cell?location=${el.warehouse.toLowerCase()}-${el.location.toLowerCase()}&warehouse=${el.warehouse.toUpperCase()}`}
                                                    label={el.location}
                                                />
                                                : <Minus size={16}/>
                                            }
                                        </TableCell>
                                        <QuantityCell quantity={el.quantity}/>
                                        <TableCell className="text-sm font-mono max-w-[100px] truncate">
                                            <div className="flex items-center gap-2"><LinkCell href=""
                                                                                               label={el.material_number}/>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {el.robot_data
                                                ? <LinkCell href={`/robot/${el.robot_data.id}`}
                                                            label={el.robot_data.robot_number}/>
                                                : <Minus size={16}/>
                                            }
                                        </TableCell>
                                        <TableCell
                                            className="text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                                            {timeToString(dayjs(el.created_at).valueOf())}
                                        </TableCell>
                                        {/*<TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm"><Trash2 size={13}/></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action cannot be
                                                            undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(el)}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>*/}
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
    );
};

export default StockHistoryList;