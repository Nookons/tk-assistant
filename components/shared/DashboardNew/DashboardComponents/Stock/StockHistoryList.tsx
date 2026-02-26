import React from 'react';
import {useUserStore} from "@/store/user";
import {getUserWarehouse} from "@/utils/getUserWarehouse";
import {useStockStore} from "@/store/stock";
import {useMutation} from "@tanstack/react-query";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {StockService} from "@/services/stockService";
import {toast} from "sonner";
import dayjs from "dayjs";
import {ClipboardList, Package, Trash2} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {timeToString} from "@/utils/timeToString";

const StockHistoryList = () => {
    const user = useUserStore(state => state.currentUser);
    const warehouse = getUserWarehouse(user?.warehouse || "");
    const stock_history = useStockStore(state => state.stock_history);
    const store_stock_add_history = useStockStore(state => state.add_item_to_history);


    const handleDelete = async (item: IHistoryStockItem) => {
        try {
            const response = await StockService.addStockHistory({
                ...item,
                quantity: -item.quantity,
            })
            store_stock_add_history(response)

            await StockService.addStockRecord({
                ...item,
                quantity: -item.quantity
            })

            toast.success(`Item was successfully added to Stock`)

        } catch (err) {
            err && toast.error(err.toString());
        }
    };

    if (!stock_history) return null;

    const sorted = [...stock_history.filter(robot => warehouse.toLowerCase() === 'leader' || robot.warehouse === warehouse)]
        .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
        .slice(0, 25);

    return (
        <div className="rounded-xl border bg-card overflow-hidden h-full flex flex-col">
            <div>
                <p className={`px-4 py-2 text-xs font-medium text-muted-foreground`}>In this section, you will find historical data exclusively for the warehouse in which you are currently working.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30 shrink-0">
                <ClipboardList size={15} className="text-muted-foreground"/>
                <span className="text-sm font-medium">Recent Entries</span>
                <Badge variant="secondary" className="ml-auto text-xs">{sorted.length}</Badge>
            </div>
            <div className="overflow-auto flex-1">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs w-[80px]">Actions</TableHead>
                            <TableHead className="text-xs">Employee</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Warehouse</TableHead>
                            <TableHead className="text-xs hidden md:table-cell">Location</TableHead>
                            <TableHead className="text-xs">Qty</TableHead>
                            <TableHead className="text-xs">Material</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                    <Package size={24} className="mx-auto mb-2 opacity-30"/>
                                    No entries yet for {warehouse}
                                </TableCell>
                            </TableRow>
                        )}
                        {sorted.map((el) => (
                            <TableRow key={el.id} className={el.quantity < 0 ? "bg-destructive/5 hover:bg-destructive/10" : ""}>
                                <TableCell>
                                    <ButtonGroup>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(el)}
                                        >
                                            <Trash2 size={13}/>
                                        </Button>
                                    </ButtonGroup>
                                </TableCell>
                                <TableCell className="text-sm font-medium">{el.user.user_name}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <Badge variant="outline" className="text-xs font-mono">{el.warehouse}</Badge>
                                </TableCell>
                                <TableCell className="text-sm font-mono text-muted-foreground hidden md:table-cell">{el.location}</TableCell>
                                <TableCell className={`text-sm font-semibold tabular-nums ${el.quantity < 0 ? "text-destructive" : "text-emerald-500"}`}>
                                    {el.quantity > 0 ? `+${el.quantity.toLocaleString()}` : el.quantity.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-sm font-mono text-muted-foreground max-w-[100px] truncate">{el.material_number}</TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                                    {timeToString(dayjs(el.created_at).valueOf())}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default StockHistoryList;