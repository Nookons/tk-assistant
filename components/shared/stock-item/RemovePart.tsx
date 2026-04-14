import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react";
import { IStockLocationSlot } from "@/types/stock/StockItem";
import { StockService } from "@/services/stockService";
import { useSessionStore } from "@/store/session";
import { useStockStore } from "@/store/stock";
import { useStockSlots } from "@/store/stock-slots";

const RemovePart = ({ slot }: { slot: IStockLocationSlot }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const session = useSessionStore(state => state.currentSession);
    const add_store_history = useStockStore(state => state.add_item_to_history);
    const remove_exception = useStockSlots(state => state.remove_exception);

    const handleRemove = async () => {
        if (!session) return;

        setIsLoading(true);
        try {
            const data = {
                ...slot,
                quantity: -slot.quantity,
                card_id: session.user.card_id,
            };

            const response = await StockService.addStockHistory(data);
            add_store_history(response);

            const response_subtract = await StockService.subtractFromStock(slot, slot.quantity);
            remove_exception(response_subtract.id);

            setOpen(false);
        } catch (err) {
            console.error('Failed to remove part:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        <span className="font-medium text-foreground mx-2">{slot.material_number}</span>
                        in amount
                        <span className="font-medium text-foreground mx-2">{slot.quantity}</span>
                        from stock.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleRemove();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removing...
                            </>
                        ) : (
                            'Continue'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default RemovePart;