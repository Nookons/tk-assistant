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
import {Loader2, Package} from "lucide-react";

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

        if (!location || location.length !== 4) {
            toast.error("Location must be exactly 4 characters")
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
            await AddToStock({
                card_id: user_store!.card_id.toString(),
                material_number: picked_template!.material_number,
                warehouse,
                location,
                quantity
            })

            await AddToStockHistory({
                card_id: user_store!.card_id.toString(),
                material_number: picked_template!.material_number,
                warehouse,
                location,
                quantity
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

    const handleLocationChange = (value: string) => {
        if (value.length > 4) {
            return
        }

        setLocation(value.replace("-", "").toUpperCase())
    }

    const isFormValid = picked_template && warehouse && location.length === 4 && quantity && parseInt(quantity) > 0

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
                {/* Main Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div>
                            <label className="text-sm font-medium">
                                Location (4 characters) <span className="text-destructive">*</span>
                            </label>
                        </div>
                        <InputOTP
                            maxLength={4}
                            value={location}
                            onChange={handleLocationChange}
                            disabled={isSubmitting}
                            inputMode="text"                 // 🔑 ВАЖНО
                            autoCapitalize="characters"
                            autoCorrect="off"
                            spellCheck={false}
                        >
                            <InputOTPGroup className="w-full justify-center">
                                <InputOTPSlot index={0} className="w-full h-10 text-base" />
                                <InputOTPSlot index={1} className="w-full h-10 text-base" />
                                <InputOTPSlot index={2} className="w-full h-10 text-base" />
                                <InputOTPSlot index={3} className="w-full h-10 text-base" />
                            </InputOTPGroup>
                        </InputOTP>
                        <p className="text-xs text-muted-foreground">
                            Enter the 4-character storage location code
                        </p>
                    </div>

                    {/* Material Picker */}

                    {/* Create New Template */}
                    {/*<CreateNewStockTemplate />*/}

                    {/* Loading State */}
                    {isLoadingTemplate && (
                        <div className="flex items-center gap-2 p-4 rounded-lg border bg-muted/50">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading template...</span>
                        </div>
                    )}

                    {/* Selected Template Info & Form */}
                    {location && (
                        <div className="space-y-4 sm:p-6 rounded-lg">
                            {/* Template Info */}
                            {/*<div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <p className="text-sm font-medium">
                                            {picked_template.material_number}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {picked_template.description_eng || picked_template.description_orginall}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="outline">{picked_template.part_type || 'N/A'}</Badge>
                                    {picked_template.description_orginall && picked_template.description_eng && (
                                        <Badge variant="secondary">{picked_template.description_orginall}</Badge>
                                    )}
                                </div>
                            </div>*/}

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div className={`flex flex-wrap items-start gap-4 ${isSubmitting ? 'opacity-50' : ''}`}>
                                    <div className="space-y-2 w-full">
                                        <AllPartsPicker
                                            setSelected={setSelected}
                                            selected={selected}
                                        />
                                    </div>
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
                                    disabled={!isFormValid || isSubmitting}
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
        </div>
    )
}

export default Page