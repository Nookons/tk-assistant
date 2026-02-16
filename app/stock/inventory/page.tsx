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
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import CreateNewStockTemplate from "@/components/shared/Stock/CreateNewStockTemplate";
import {AddToStock} from "@/futures/stock/AddToStock";
import {AddToStockHistory} from "@/futures/stock/AddToStockHistory";
import {BellPlus, Bot, Copy, Loader2, Package} from "lucide-react";
import StockHistoryList from "@/components/shared/Stock/StockHistoryList";
import {Label} from "@/components/ui/label";
import TemplateEditDialog from "@/components/shared/Stock/TemplateEditDialog";
import TemplatePhotoChange from "@/components/shared/Stock/TemplatePhotoChange";
import {Separator} from "@/components/ui/separator";
import dayjs from "dayjs";
import {Item} from "@/components/ui/item";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import StockItemPreview from "@/components/shared/Stock/StockItemPreview";

const Page = () => {
    const [selected, setSelected] = useState<string>("")
    const [location, setLocation] = useState<string>("")
    const [warehouse, setWarehouse] = useState<string>("GLPC")
    const [quantity, setQuantity] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false)

    const user_store = useUserStore(state => state.currentUser)
    const items_templates = useStockStore(state => state.items_templates)
    const [picked_template, setPicked_template] = useState<IStockItemTemplate | null>(null)

    const add_new = useStockStore(state => state.add_item_to_history);

    useEffect(() => {
        if (!selected) {
            setPicked_template(null)
            return
        }

        if (!items_templates || !Array.isArray(items_templates)) {
            setPicked_template(null)
            return
        }

        setIsLoadingTemplate(true)

        const timeoutId = setTimeout(() => {
            try {
                const find_res = items_templates.find(item =>
                    item?.material_number === selected
                )
                setPicked_template(find_res || null)

                if (!find_res && selected) {
                    toast.error("Template not found for selected material")
                }
            } catch (error) {
                console.error("Error finding template:", error)
                setPicked_template(null)
            } finally {
                setIsLoadingTemplate(false)
            }
        }, 100)

        return () => clearTimeout(timeoutId)
    }, [selected, items_templates])

    const validateForm = () => {
        if (!user_store) {
            toast.error("User not found. Please log in.")
            return false
        }

        if (!picked_template) {
            toast.error("Please select a material")
            return false
        }

        if (!warehouse) {
            toast.error("Please select a warehouse")
            return false
        }

        if (!quantity || parseInt(quantity) <= 0) {
            toast.error("Please enter a valid quantity")
            return false
        }

        return true
    }

    const handleCreateNew = async () => {
        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            if (!user_store) {
                throw new Error("User not found")
            }

            const data = {
                id: dayjs().valueOf(),
                card_id: user_store!.card_id.toString(),
                material_number: picked_template!.material_number,
                location_key: `${warehouse.toLowerCase()}-${location.toLowerCase()}`,
                warehouse,
                location,
                quantity
            }

            await AddToStock(data)
            await AddToStockHistory(data)

            add_new({
                ...data,
                value: Number(quantity),
                created_at: dayjs().toDate(),
                add_by: user_store?.card_id || 0,
                user: user_store
            })

            toast.success("Successfully added to stock", {
                description: `${quantity} units of ${picked_template!.material_number}`
            })

            setQuantity("")

        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to add to stock. Please try again."

            toast.error(errorMessage)
            console.error("Error adding to stock:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === "" || /^\d+$/.test(value)) {
            setQuantity(value)
        }
    }

    const handleWarehouseChange = (value: string) => {
        setWarehouse(value)
    }


    return (
        <div className="min-h-screen bg-background grid grid-cols-1 gap-4 p-4 md:grid-cols-[550px_1fr]">
            <div className="container mx-auto space-y-6">
                {/* Main Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div>
                            <label className="text-sm font-medium">
                                Location (GLPC, PNT, SMALL P3) <span className="text-destructive">*</span>
                            </label>
                        </div>
                        <Input
                            type={`text`}
                            placeholder={``}
                            value={location}
                            onChange={(e) => setLocation(e.target.value.toUpperCase())}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the characters storage location code for GLPC, PNT whatever
                        </p>
                    </div>

                    {/* Loading State */}
                    {isLoadingTemplate && (
                        <div className="flex items-center gap-2 p-4 rounded-lg border bg-muted/50">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading template...</span>
                        </div>
                    )}

                    {/* Selected Template Info & Form */}
                    {location && (
                        <div className="space-y-4 rounded-lg">

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div className={`flex flex-wrap items-start gap-4 ${isSubmitting ? 'opacity-50' : ''}`}>
                                    <div className="space-y-2 w-full">
                                        <AllPartsPicker
                                            setSelected={setSelected}
                                            selected={selected}
                                        />
                                    </div>

                                    {picked_template && (
                                        <StockItemPreview data={picked_template} />
                                    )}

                                   <div className={`grid w-full grid-cols-2 gap-4 ${isSubmitting ? 'opacity-50' : ''}`}>
                                       {/* Quantity */}
                                       <div className="space-y-2 w-full">
                                           <div>
                                               <label className="text-sm font-medium">
                                                   Quantity <span className="text-destructive">*</span>
                                               </label>
                                           </div>
                                           <Input
                                               type="text"
                                               inputMode="numeric"
                                               placeholder="Enter quantity"
                                               value={quantity}
                                               onChange={handleQuantityChange}
                                               disabled={isSubmitting}
                                               className="text-base w-full"
                                           />
                                       </div>

                                       {/* Warehouse */}
                                       <div className="space-y-2 min-w-[150px]">
                                           <div>
                                               <label className="text-sm font-medium">
                                                   Warehouse <span className="text-destructive">*</span>
                                               </label>
                                           </div>
                                           <Select
                                               value={warehouse}
                                               onValueChange={handleWarehouseChange}
                                               disabled={isSubmitting}
                                           >
                                               <SelectTrigger className="text-base w-full">
                                                   <SelectValue defaultValue={"SMALL_P3"} placeholder="Select warehouse" />
                                               </SelectTrigger>
                                               <SelectContent>
                                                   <SelectGroup>
                                                       <SelectLabel>Available Warehouses</SelectLabel>
                                                       <SelectItem value="GLPC">GLPC</SelectItem>
                                                       <SelectItem value="SMALL_P3">SMALL P3</SelectItem>
                                                       <SelectItem value="PNT">PNT</SelectItem>
                                                   </SelectGroup>
                                               </SelectContent>
                                           </Select>
                                       </div>
                                   </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={handleCreateNew}
                                    disabled={isSubmitting}
                                    className="w-full h-11 text-base"
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding to stock...
                                        </>
                                    ) : (
                                        <>
                                            <Package className="mr-2 h-4 w-4" />
                                            Add to Stock
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* No Template Found */}
                    {selected && !picked_template && !isLoadingTemplate && (
                        <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
                            <p className="text-sm text-destructive font-medium">
                                Template not found
                            </p>
                            <p className="text-xs text-destructive/80 mt-1">
                                No template found for material number: {selected}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div className={`overflow-hidden`}>
                <StockHistoryList />
            </div>
        </div>
    )
}

export default Page