import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IStockItemTemplate } from "@/types/stock/StockItem";
import { useSessionStore } from "@/store/session";
import { StockService } from "@/services/stockService";
import { useStockStore } from "@/store/stock";
import {useStockSlots} from "@/store/stock-slots";

interface FormState {
    location: string;
    quantity: string;
}

const AddPartsDisplay = ({ part }: { part: IStockItemTemplate }) => {
    const session = useSessionStore(state => state.currentSession);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<FormState>({ location: '', quantity: '' });

    const addItemToHistory = useStockStore(state => state.add_item_to_history);
    const addItemToSloct = useStockSlots(state => state.update_stock_slot);

    if (!session) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.name === 'location'
            ? e.target.value.replace(/[а-яёА-ЯЁ]/g, '').toUpperCase()
            : e.target.value;

        setForm(prev => ({ ...prev, [e.target.name]: value }));
    };

    const handleOpenChange = (value: boolean) => {
        if (isLoading) return; // блокируем закрытие во время загрузки
        if (!value) setForm({ location: '', quantity: '' }); // сброс при закрытии
        setOpen(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.location || !form.quantity) return;

        const data = {
            location: form.location.toUpperCase(),
            quantity: Number(form.quantity),
            card_id: session.user.card_id,
            material_number: part.material_number,
            warehouse: session.warehouse.title,
        };

        setIsLoading(true);

        const toastId = toast.loading(`Adding ${part.material_number}...`);

        try {
            const history_response = await StockService.addStockHistory(data);
            console.log('>>> history done:', history_response);

            const stock_response = await StockService.addStockRecord(data);
            console.log('>>> stock done:', stock_response);

            addItemToHistory(history_response);
            addItemToSloct(stock_response);

            toast.success('Part added successfully', {
                id: toastId,
                description: `${data.quantity} × ${part.material_number} → ${data.location} (${session.warehouse.title})`,
            });

            setForm({ location: '', quantity: '' });
            setOpen(false);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Something went wrong. Please try again.';

            toast.error('Failed to add part', {
                id: toastId,
                description: message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <Plus />
                    <span>Add parts</span>
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-sm"
                onInteractOutside={e => isLoading && e.preventDefault()} // блокируем клик вне во время загрузки
            >
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add {part.material_number}</DialogTitle>
                        <DialogDescription>
                            This part will be added for warehouse{' '}
                            <span className="font-medium text-foreground">
                                {session.warehouse.title}
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="my-4">
                        <Field>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder="C123"
                                value={form.location}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min={1}
                                placeholder="20"
                                value={form.quantity}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save changes'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddPartsDisplay;