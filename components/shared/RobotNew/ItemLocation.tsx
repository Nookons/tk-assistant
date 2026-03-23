import React from 'react';
import {IStockLocationSlot} from "@/types/stock/StockItem";
import {Item} from "@/components/ui/item";
import {timeToString} from "@/utils/timeToString";
import {Checkbox} from "@/components/ui/checkbox";
import {MapPinHouse} from "lucide-react";

const ItemLocation = (
    {item, selectedLocation, setSelectedLocation}:
    {
        item: IStockLocationSlot,
        selectedLocation: IStockLocationSlot | null,
        setSelectedLocation: (data: IStockLocationSlot) => void
    }) => {


    const handleChange = () => {
        setSelectedLocation(item)
    }

    return (
        <div className={`flex border p-2 rounded-md items-center justify-between gap-2`}>
            <div className={`flex items-center gap-2`}>
                <Checkbox
                    checked={item.location_key === selectedLocation?.location_key}
                    onCheckedChange={handleChange}
                    disabled={item.quantity < 1}
                    id="terms-checkbox"
                    name="terms-checkbox"
                />
                <p className={`font-medium`}>{item.quantity.toLocaleString()}</p>
            </div>
            <div className={`flex gap-2 items-center`}>
                <MapPinHouse size={16} />
                <p className={`font-medium`}>{item.location}</p>
            </div>
        </div>
    );
};

export default ItemLocation;