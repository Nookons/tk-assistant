import React, { useMemo } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {useStockStore} from "@/store/stock";

const ItemHistory = ({ material_number }: { material_number: string }) => {
    const store_item = useStockStore(state => state.stock_history)

    const sorted_data = useMemo(() => {
        if (!store_item) return null;
        return [...store_item].filter(part => part.material_number === material_number).sort(
            (a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
        );
    }, [store_item]);

    if (!store_item) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                ))}
            </div>
        );
    }

    if (!sorted_data?.length) {
        return (
            <Empty className="h-full bg-muted/30">
                <EmptyHeader>
                    <EmptyTitle>No history</EmptyTitle>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Quantity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Robot</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sorted_data.map((item) => {
                    const isNegative = item.quantity < 0;
                    return (
                        <TableRow key={item.id}>
                            <TableCell
                                className={cn(
                                    "font-medium",
                                    isNegative ? "text-red-600" : "text-green-700"
                                )}
                            >
                                {isNegative ? "" : "+"}
                                {item.quantity}
                            </TableCell>
                            <TableCell>{item.user.user_name}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {item.location ?? "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {item.robot_data?.robot_number ?? "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {item.warehouse ?? "—"}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(item.created_at), "dd MMM yyyy, HH:mm")}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default ItemHistory;