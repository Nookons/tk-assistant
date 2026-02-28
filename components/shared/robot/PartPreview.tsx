import React, {useState} from 'react';
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {IRobot} from "@/types/robot/robot";
import {robotService} from "@/services/robotService";
import {toast} from "sonner";
import {useRobotsStore} from "@/store/robotsStore";

const PartPreview = ({selectedPart, robot}: {selectedPart: IStockItemTemplate, robot: IRobot}) => {
    const [quantity, setQuantity] = useState<number>(1);
    const addPartsHistory = useRobotsStore(state => state.addPartsHistory)

    const handleSubmit = async () => {
        if (!selectedPart) return;

        try {
            const result = await robotService.addNewPart({part: selectedPart, quantity, robot})

            if (result) {
                addPartsHistory(robot.id, result)
            }

        } catch (error) {
            error && toast.error(error.toString())
        }
    };

    return (
        <div>
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Selected part</p>
                <p className="text-base font-semibold mt-1">{selectedPart.description_eng}</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{selectedPart.material_number}</p>
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest">
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
                    <Button
                        onClick={handleSubmit}
                        className={``}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PartPreview;