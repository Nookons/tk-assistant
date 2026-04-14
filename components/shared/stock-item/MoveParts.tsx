import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from 'react';
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IStockLocationSlot } from "@/types/stock/StockItem";
import { useSessionStore } from "@/store/session";
import {StockService} from "@/services/stockService";
import StockSlots from "@/components/shared/stock-item/stock-slots";
import {useStockSlots} from "@/store/stock-slots";
import {useStockStore} from "@/store/stock";

const MovePartDialog = ({ slot }: { slot: IStockLocationSlot }) => {
    const session = useSessionStore(state => state.currentSession);

    const update_slot = useStockSlots(state => state.update_stock_slot)
    const remove_slot = useStockSlots(state => state.remove_exception)
    const add_stock_slot = useStockSlots(state => state.add_stock_slot)

    const add_item_to_history = useStockStore(state => state.add_item_to_history)

    const [open, setOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [newLocation, setNewLocation] = useState("");
    const [quantity, setQuantity] = useState<number | "">(slot.quantity);

    const handleClose = () => {
        setOpen(false);
        setNewLocation("");
        setQuantity(slot.quantity);
    };

    const handleMove = async () => {
        try {
            if (!session) throw new Error("No session found");
            if (!newLocation.trim()) throw new Error("Location is required");
            if (newLocation.trim() === slot.location) throw new Error("Cannot move to the same location");
            if (!quantity || quantity <= 0) throw new Error("Quantity must be greater than 0");
            if (quantity > slot.quantity) throw new Error(`Quantity cannot exceed available stock (${slot.quantity})`);

            setIsSending(true);

            const new_data = {
                card_id: session.user.card_id,
                material_number: slot.material_number,
                quantity: quantity ?? 0,
                warehouse: session.warehouse.title,
                location: newLocation,
                robot_id: null,
                robot_data: null,
                user: session.user,
            }

            const add_history_old = await StockService.addStockHistory({...slot, quantity: -quantity, card_id: session.user.card_id})
            const add_history_new = await StockService.addStockHistory(new_data)

            add_item_to_history(add_history_old)
            add_item_to_history(add_history_new)

            const response = await StockService.moveSlot(new_data, slot ,session.user.card_id)

            if (response.subtracted) {
                if (response.subtracted.quantity < 1) {
                    remove_slot(response.subtracted.id);
                } else {
                    update_slot(response.subtracted)
                }
            }

            add_stock_slot(response.added)
            toast.success("Part moved successfully");
            setQuantity("");
            handleClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error moving part");
            console.error("Error moving part:", error);
        } finally {
            setIsSending(false);
        }
    };

    const isValid = newLocation.trim() && quantity && quantity > 0 && quantity <= slot.quantity;

    return (
        <Dialog open={open} onOpenChange={(value) => value ? setOpen(true) : handleClose()}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <ArrowLeftRight className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Move part</DialogTitle>
                    <DialogDescription>
                        Move <span className="font-medium text-foreground">{slot.material_number}</span> from{" "}
                        <span className="font-medium text-foreground">{slot.location}</span> to a new location.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="new-location">New location</Label>
                        <Input
                            id="new-location"
                            placeholder="e.g. A-12-3"
                            value={newLocation}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[а-яёА-ЯЁ]/g, "").toUpperCase();
                                setNewLocation(value);
                            }}
                            disabled={isSending}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="quantity">
                            Quantity
                            <span className="ml-1 text-xs text-muted-foreground">(max: {slot.quantity})</span>
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            max={slot.quantity}
                            placeholder={String(slot.quantity)}
                            value={quantity}
                            onChange={(e) => {
                                const val = e.target.value === "" ? "" : Math.min(Number(e.target.value), slot.quantity);
                                setQuantity(val);
                            }}
                            disabled={isSending}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSending}>
                        Cancel
                    </Button>
                    <Button onClick={handleMove} disabled={isSending || !isValid}>
                        {isSending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Moving...
                            </>
                        ) : (
                            "Move part"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MovePartDialog;