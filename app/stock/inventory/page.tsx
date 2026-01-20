'use client'

import React, {useEffect, useState} from 'react';
import AllPartsPicker from "@/components/shared/AllPartsPicker/AllPartsPicker";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {useUserStore} from "@/store/user";
import {useStockStore} from "@/store/stock";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot} from "@/components/ui/input-otp";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import CreateNewStockTemplate from "@/components/shared/Stock/CreateNewStockTemplate";
import {AddToStock} from "@/futures/stock/AddToStock";
import {AddToStockHistory} from "@/futures/stock/AddToStockHistory";
import {Separator} from "@radix-ui/react-select";

const Page = () => {
    const [selected, setSelected] = useState("")
    const [location, setLocation] = useState("")
    const [warehouse, setWarehouse] = useState("")
    const [quantity, setQuantity] = useState("")

    const user_store = useUserStore(state => state.current_user)
    const items_templates = useStockStore(state => state.items_templates)
    const [picked_template, setPicked_template] = useState<IStockItemTemplate | null>(null)

    useEffect(() => {
        const find_res = items_templates?.find(item => item.material_number === selected)
        setPicked_template(find_res || null)
    }, [selected, items_templates]);

    const handleCreateNew = async () => {
        try {

            if (!user_store) throw new Error("User not found")
            if (!picked_template) throw new Error("Template not found")

            if (!location) throw new Error("Location can't be empty")
            if (!quantity) throw new Error("Quantity can't be empty")
            if (!warehouse) throw new Error("Warehouse can't be empty")

            await AddToStock({
                card_id: user_store.card_id.toString(),
                material_number: picked_template.material_number,
                warehouse,
                quantity
            })

            await AddToStockHistory({
                card_id: user_store.card_id.toString(),
                material_number: picked_template.material_number,
                warehouse,
                location,
                value: quantity
            })

            toast.success("Added to stock")

            setLocation("")
            setQuantity("")

        } catch (error) {
            error && toast.error(error.toString() || "Unknown error")
            console.log(error);
        }
    }

    const handleQuantityChange = (value: string) => {
        setQuantity(value)
    }

    const handleWarehouseChange = (value: string) => {
        setWarehouse(value)
    }

    const handleLocationChange = (value: string) => {
        if (value.length > 4) {
            toast.error("Quantity must be 4 digits")
            return
        }
        setLocation(value.toUpperCase())
    }


    return (
        <div className={`p-4 max-w-[800px] m-auto flex flex-col gap-4`}>
            <CreateNewStockTemplate />

            <AllPartsPicker
                selected={selected}
                setSelected={setSelected}
            />

            <hr className={`w-full`} />

            {selected && (
                <div className={`max-w-full mt-4`}>
                    <div className={`grid md:grid-cols-3 items-center gap-4 mt-4`}>
                        <div>
                            <label>Quantity</label>
                            <Input
                                value={quantity}
                                type={`number`}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className={`mb-1`}>Warehouses</label>
                            <Select value={warehouse} onValueChange={handleWarehouseChange}>
                                <SelectTrigger className={`w-full`}>
                                    <SelectValue placeholder="Select warehouse"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Warehouses</SelectLabel>
                                        <SelectItem value="GLPC">GLPC</SelectItem>
                                        <SelectItem value="SMALL_P3">SMALL P3</SelectItem>
                                        <SelectItem value="PNT">PNT</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className={`mb-1`}>Location</label>
                            <InputOTP
                                maxLength={6}
                                value={location}
                                onChange={handleLocationChange}
                                inputMode="text"
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot  index={0}/>
                                    <InputOTPSlot index={1}/>
                                </InputOTPGroup>
                                <InputOTPSeparator/>
                                <InputOTPGroup>
                                    <InputOTPSlot index={2}/>
                                </InputOTPGroup>
                                <InputOTPSeparator/>
                                <InputOTPGroup>
                                    <InputOTPSlot index={3}/>
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    </div>

                    <div className={`flex flex-col justify-end mt-4`}>
                        <Button onClick={handleCreateNew}>
                            Add
                        </Button>
                    </div>

                    <div className={`flex flex-col overflow-hidden gap-2 mt-4`}>
                        <p className={`text-base text-muted-foreground`}>{picked_template?.part_type} - {picked_template?.description_eng} - {picked_template?.description_orginall}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;