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
import {Annoyed} from "lucide-react";
import {Empty, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {Checkbox} from "@/components/ui/checkbox";
import {Field} from "@/components/ui/field";
import Image from "next/image";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";

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
            <div className="relative w-full aspect-square rounded-md overflow-hidden mb-2">
                {isLoading && (
                    <Skeleton className="absolute anim-pulse inset-0 w-full h-full" />
                )}
                <>
                    {selectedPart.avatar_url
                    ?
                        <Image
                            key={selectedPart.avatar_url}
                            src={selectedPart.avatar_url}
                            alt="item image"
                            fill
                            className={cn("object-cover transition-opacity", isLoading ? "opacity-0" : "opacity-100")}
                            onLoad={() => setIsLoading(false)}
                        />
                    :
                        <div className={`flex h-full justify-center items-center`}>NO IMG</div>
                    }
                </>
            </div>
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Selected part</p>
                <p className="text-base font-semibold mt-1">{selectedPart.description_eng}</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{selectedPart.material_number}</p>
            </div>
            {
                !locations_data.length
                ?
                    <Empty className="bg-muted/30  my-2">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Annoyed />
                            </EmptyMedia>
                            <EmptyTitle>No Parts on stock</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
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
                        Save
                    </Button>
                </div>
                <div className={`mt-2`}>
                    <Field orientation="horizontal">
                        <Checkbox
                            checked={isEmptyAdd}
                            onCheckedChange={() => setIsEmptyAdd(!isEmptyAdd)}
                            id="terms-checkbox"
                            name="terms-checkbox"
                        />
                        <Label htmlFor="terms-checkbox">Add without stock</Label>
                    </Field>
                </div>
            </div>
        </div>
    );
};

export default PartPreview;