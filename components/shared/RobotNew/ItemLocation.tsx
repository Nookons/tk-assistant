import React from 'react';
import {IStockLocationSlot} from "@/types/stock/StockItem";
import {Item} from "@/components/ui/item";
import {timeToString} from "@/utils/timeToString";
import {Checkbox} from "@/components/ui/checkbox";

const ItemLocation = (
    {item, selectedLocation, setSelectedLocation}:
    {item: IStockLocationSlot, selectedLocation: IStockLocationSlot | null, setSelectedLocation: (data: IStockLocationSlot) => void}) => {


    const handleChange = () => {
        setSelectedLocation(item)
    }

    return (
        <Item variant={`muted`} className={`${item.quantity < 1 && "bg-muted"}`}>
            <div className={`flex justify-between gap-2 w-full text-right`}>
                <Checkbox
                    checked={item.location_key === selectedLocation?.location_key}
                    onCheckedChange={handleChange}
                    disabled={item.quantity < 1}
                    id="terms-checkbox"
                    name="terms-checkbox"
                />
                <p className={`text-xs text-muted-foreground`}>{timeToString(item.updated_at)}</p>
            </div>
            <div className={`flex justify-between gap-2 w-full text-right`}>
                <p>{item.quantity.toLocaleString()}</p>
                <p className={`font-medium`}>{item.location}</p>
            </div>
        </Item>
    );
};

export default ItemLocation;