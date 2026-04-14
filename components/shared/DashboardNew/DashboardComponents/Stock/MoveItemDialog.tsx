import React from 'react';
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LocationItem, LocationStock } from "@/types/stock/SummaryItem";
import { useUserStore } from "@/store/user";
import {toast} from "sonner";

interface MoveItemDialogProps {
    el: LocationStock;
    item: LocationItem;
    onClose: () => void;
    onUpdate: (locationKey: string, newItems: LocationItem[]) => void;
    stockData: LocationStock[];
}

const MoveItemDialog = ({ el, item, onClose, onUpdate, stockData }: MoveItemDialogProps) => {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const user = useUserStore(state => state.currentUser);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        const formData = new FormData(e.currentTarget);
        const newLocation = (formData.get("new_location") as string).trim().toUpperCase();
        const newLocationKey = `${item.warehouse.toLowerCase()}-${newLocation.toLowerCase()}`;
        const quantity = Number(formData.get("quantity"));

        if (!newLocation) return setError("Location is required.");
        if (`${item.warehouse.toLowerCase()}-${newLocation.toLowerCase()}` === item.location_key) {
            return setError("New location must differ from current.");
        }
        if (!quantity || quantity <= 0) return setError("Quantity must be greater than 0.");
        if (quantity > item.total_quantity) return setError(`Max available: ${item.total_quantity}.`);

        setLoading(true);
        setError(null);

        try {
            const isFullMove = quantity === item.total_quantity;

            // Старая локация — передаём el.location
            const updatedOldItems = isFullMove
                ? el.items.filter(i => i.material_number !== item.material_number)
                : el.items.map(i =>
                    i.material_number === item.material_number
                        ? { ...i, total_quantity: i.total_quantity - quantity }
                        : i
                );
            onUpdate(el.location, updatedOldItems);

            // Новая локация — ищем и передаём newLocation
            const target = stockData.find(s => s.location === newLocation);
            const existingItem = target?.items.find(i => i.material_number === item.material_number);
            const targetItems = target?.items ?? [];
            const updatedNewItems = existingItem
                ? targetItems.map(i =>
                    i.material_number === item.material_number
                        ? { ...i, total_quantity: i.total_quantity + quantity }
                        : i
                )
                : [...targetItems];
            onUpdate(newLocation, updatedNewItems);

            setOpen(false);
            onClose();
            toast.success(`Location updated: ${newLocation}. Need to refresh the page to see new data -> sry its be fixed`);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Unexpected error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <ArrowRightLeft />
                    <span>Move</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Change Location</DialogTitle>
                        <DialogDescription>
                            Moving <strong>{item.material_number}</strong> from{" "}
                            <strong>{item.location_key}</strong>.{" "}
                            Available: <strong>{item.total_quantity}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="mt-2 gap-2">
                        <Field>
                            <Label htmlFor="new_location">New Location</Label>
                            <Input
                                id="new_location"
                                name="new_location"
                                placeholder="e.g. A-123"
                                disabled={loading}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="quantity">
                                Quantity{" "}
                                <span className="text-xs text-muted-foreground font-normal">
                                    (max {item.total_quantity})
                                </span>
                            </Label>
                            <Input
                                type="number"
                                id="quantity"
                                name="quantity"
                                min={1}
                                max={item.total_quantity}
                                defaultValue={item.total_quantity}
                                disabled={loading}
                            />
                        </Field>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </FieldGroup>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Moving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default MoveItemDialog;