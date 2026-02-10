import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import dayjs from "dayjs";
import {timeToString} from "@/utils/timeToString";
import { ButtonGroup } from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {Pencil, Trash2} from "lucide-react";
import {useStockStore} from "@/store/stock";
import {useMutation} from "@tanstack/react-query";
import {StockService} from "@/services/stockService";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";

const StockHistoryList = () => {
    const stock_history = useStockStore(state => state.stock_history);
    const delete_item_from_history = useStockStore(state => state.delete_item_from_history);

    const handleRemove = useMutation({
        mutationFn: (data: IHistoryStockItem) => StockService.removeHistoryItem(data),
        onSuccess: (deletedItem) => {
            console.log(deletedItem);
            if (delete_item_from_history) {
                delete_item_from_history(deletedItem.id.toString());
            }
        },
        onError: (error) => {
            console.error('Failed to remove item:', error);
        }
    });

    const handleDelete = (id: IHistoryStockItem) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            handleRemove.mutate(id);
        }
    };

    if (!stock_history) return null;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Actions</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Material Number</TableHead>
                    <TableHead>Created</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stock_history
                    .sort((a, b) => {
                        const dateA = dayjs(a.created_at).valueOf();
                        const dateB = dayjs(b.created_at).valueOf();
                        return dateB - dateA;
                    })
                    .slice(0, 25)
                    .map((el) => (
                        <TableRow key={el.id}>
                            <TableCell className="flex justify-start">
                                <ButtonGroup>
                                    <Button
                                        variant="secondary"
                                        disabled={handleRemove.isPending}
                                    >
                                        <Pencil/>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(el)}
                                        disabled={handleRemove.isPending}
                                    >
                                        <Trash2/>
                                    </Button>
                                </ButtonGroup>
                            </TableCell>
                            <TableCell className="font-medium">{el.user.user_name}</TableCell>
                            <TableCell className="font-medium">{el.warehouse}</TableCell>
                            <TableCell className="font-medium">{el.location}</TableCell>
                            <TableCell className="font-medium">{el.value}</TableCell>
                            <TableCell className="font-medium">{el.material_number}</TableCell>
                            <TableCell className="font-medium">
                                {timeToString(dayjs(el.created_at).valueOf())}
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    );
};

export default StockHistoryList;