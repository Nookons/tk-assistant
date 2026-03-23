import React, {useEffect, useState} from 'react';
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {IStockItemTemplate, IStockLocationSlot} from "@/types/stock/StockItem";
import {IRobot} from "@/types/robot/robot";
import {robotService} from "@/services/robotService";
import {toast} from "sonner";
import {useRobotsStore} from "@/store/robotsStore";
import {useUserStore} from "@/store/user";
import {StockService} from "@/services/stockService";
import ItemLocation from "@/components/shared/RobotNew/ItemLocation";
import {Annoyed, Save} from "lucide-react";
import {Empty, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {Checkbox} from "@/components/ui/checkbox";
import {Field} from "@/components/ui/field";
import Image from "next/image";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";
import StockPartImage from "@/components/shared/StockPart/StockPartImage";

interface Props {
    selectedPart: IStockItemTemplate;
    setSelectedPart: (data: IStockItemTemplate | null) => void;
    robot: IRobot;
    onSuccess?: () => void; // ← вместо setIsOpen
}

const PartPreview: React.FC<Props> = ({selectedPart, robot, onSuccess, setSelectedPart}) => {
    const user = useUserStore(state => state.currentUser);
    const addPartsHistory = useRobotsStore(state => state.addPartsHistory);

    const [quantity, setQuantity] = useState<number>(1);
    const [selectedLocation, setSelectedLocation] = useState<IStockLocationSlot | null>(null);

    const [locations_data, setLocations_data] = useState<IStockLocationSlot[]>([]);
    const [isEmptyAdd, setIsEmptyAdd] = useState<boolean>(false);

    const handleSubmit = async () => {
        if (!selectedPart) return;
        if (!selectedLocation && !isEmptyAdd) return;

        try {
            const result = await robotService.addNewPart({part: selectedPart, quantity, robot});

            if (selectedLocation) {
                await StockService.subtractFromStock(selectedLocation, quantity);
            }

            if (result) {
                const obj = {
                    card_id: result.card_id,
                    material_number: selectedPart.material_number,
                    quantity: -quantity,
                    warehouse: result.warehouse,
                    location: selectedLocation?.location || null,
                    user: result.user,
                    robot_id: robot.id,
                }

                const history_response = await StockService.addStockHistory(obj);
                addPartsHistory(robot.id, result);
                setSelectedPart(null);
                onSuccess?.();          // ← вместо setIsOpen(false)
                toast.success("Successfully added new part(s)");
            }
        } catch (error) {
            error && toast.error(error.toString());
        }
    };

    const getItemLocations = async (warehouse: string) => {
        try {
            const response = await StockService.getStockItemLocations(selectedPart, warehouse);
            setLocations_data(response);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangeQuantity = (type: string, value?: number) => {
        if (!selectedLocation && !isEmptyAdd) {
            toast.error("Location not selected");
            return;
        }

        const max = selectedLocation?.quantity ?? 100;

        switch (type) {
            case 'minus':
                setQuantity(q => Math.max(1, q - 1));
                break;
            case 'plus':
                setQuantity(q => Math.min(max, q + 1));
                break;
            case 'input':
                setQuantity(Math.min(max, Math.max(1, value ?? 1)));
                break;
        }
    };

    useEffect(() => {
        if (selectedLocation) {
            setQuantity(q => Math.min(q, selectedLocation.quantity));
        }
    }, [selectedLocation]);

    useEffect(() => {
        if (selectedPart) {
            setSelectedLocation(null);
            setIsEmptyAdd(false);
            setLocations_data([]);
            const warehouse = user?.warehouse || "GLPC";
            getItemLocations(warehouse);
        }
    }, [selectedPart]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
    }, [selectedPart.avatar_url]);

    return (
        <div>
            <div className={`grid grid-cols-[125px_1fr] gap-4`}>
                <StockPartImage avatar_url={selectedPart.avatar_url}/>
                <div className={`flex flex-col gap-2`}>
                    <p className="text-xs text-muted-foreground">{selectedPart.description_eng}</p>
                    <p className="text-xs text-muted-foreground">{selectedPart.description_orginall}</p>
                    <p className="text-xs font-medium">{selectedPart.material_number}</p>
                </div>
            </div>
            {
                !locations_data.length
                    ?
                    <div className={`flex flex-col items-end mb-4 w-full`}>
                        <div
                            className={`border-2 w-full border-dashed my-4 flex items-center justify-between p-4 rounded-md bg-linear-to-r from-background to-red-400/50`}>
                            <Annoyed/>
                            <p className={`font-medium`}>No Parts on stock</p>
                        </div>
                        <div className={`pr-1`}>
                            <Field orientation="horizontal">
                                <p className={`text-xs text-muted-foreground`}>Without Stock</p>
                                <Checkbox
                                    checked={isEmptyAdd}
                                    onCheckedChange={() => setIsEmptyAdd(!isEmptyAdd)}
                                    id="terms-checkbox"
                                    name="terms-checkbox"
                                />
                            </Field>
                        </div>
                    </div>
                    :
                    <div className="grid grid-cols-2 gap-2 my-2">
                        {locations_data.map((item, i) => (
                            <ItemLocation
                                key={i}
                                selectedLocation={selectedLocation}
                                setSelectedLocation={setSelectedLocation}
                                item={item}
                            />
                        ))}
                    </div>

            }

            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest">
                    Quantity
                </Label>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleChangeQuantity('minus')}
                    >
                        −
                    </Button>
                    <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => handleChangeQuantity('input', Number(e.target.value))}
                        className="h-8 text-center"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleChangeQuantity('plus')}
                    >
                        +
                    </Button>
                    <Button onClick={handleSubmit}>
                        <Save /> Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PartPreview;