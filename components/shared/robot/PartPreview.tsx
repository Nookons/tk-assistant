import React, {useState} from 'react';
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {IStockItemTemplate} from "@/types/stock/StockItem";

const PartPreview = ({selectedPart}: {selectedPart: IStockItemTemplate}) => {
    const [quantity, setQuantity] = useState<number>(1);

    const handleSubmit = () => {
        if (!selectedPart) return;
        console.log({ part: selectedPart, quantity });
    };

    return (
        <div>
            <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Selected part</p>
                <p className="text-base font-semibold mt-1">{selectedPart.description_eng}</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{selectedPart.material_number}</p>
            </div>

            <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Quantity
                </Label>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >
                        −
                    </Button>
                    <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="h-8 text-center"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setQuantity(q => q + 1)}
                    >
                        +
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PartPreview;