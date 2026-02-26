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
import {toast} from "sonner";
import {AddToStock} from "@/futures/stock/AddToStock";
import {AddToStockHistory} from "@/futures/stock/AddToStockHistory";
import {Loader2, PackagePlus, Warehouse, MapPin, Hash, ClipboardList} from "lucide-react";
import StockItemPreview from "@/components/shared/Stock/StockItemPreview";
import dayjs from "dayjs";
import {Separator} from "@/components/ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import StockHistoryList from "@/components/shared/DashboardNew/DashboardComponents/Stock/StockHistoryList";
import {StockService} from "@/services/stockService";


const Field = ({label, required, hint, children}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium leading-none">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
);


const StockForm = ({
                       location, setLocation,
                       selected, setSelected,
                       quantity, setQuantity,
                       warehouse, setWarehouse,
                       picked_template, isLoadingTemplate, isSubmitting,
                       canShowForm, handleSubmit
                   }: any) => (
    <div className="p-4 sm:p-5 space-y-5">
        {/* Step 1 */}
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">1
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</span>
            </div>
            <Field label="Storage Location Code" required
                   hint="Enter the storage location code for GLPC, PNT, SMALL P3…">
                <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                    <Input
                        className="pl-2 font-mono uppercase"
                        placeholder="e.g. A-01-02"
                        value={location}
                        onChange={(e) => setLocation(e.target.value.toUpperCase())}
                    />
                </div>
            </Field>
        </div>

        {/* Step 2 */}
        <div
            className={`space-y-4 transition-opacity ${canShowForm ? "opacity-100" : "opacity-40 pointer-events-none select-none"}`}>
            <Separator/>
            <div className="flex items-center gap-2">
                <div
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">2
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Material</span>
            </div>
            {isLoadingTemplate ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin"/>Loading template…
                </div>
            ) : (
                <Field label="Material Number" required>
                    <AllPartsPicker setSelected={setSelected} selected={selected}/>
                </Field>
            )}
            {picked_template && <StockItemPreview data={picked_template}/>}
            {selected && !picked_template && !isLoadingTemplate && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5">
                    <p className="text-sm text-destructive font-medium">Template not found</p>
                    <p className="text-xs text-destructive/70 mt-0.5">No template for: <span
                        className="font-mono">{selected}</span></p>
                </div>
            )}
        </div>

        {/* Step 3 */}
        <div
            className={`space-y-4 transition-opacity ${canShowForm ? "opacity-100" : "opacity-40 pointer-events-none select-none"}`}>
            <Separator/>
            <div className="flex items-center gap-2">
                <div
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">3
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity & Warehouse</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity" required>
                    <div className="relative">
                        <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                        <Input
                            className="pl-2 tabular-nums"
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={quantity}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v === "" || /^\d+$/.test(v)) setQuantity(v);
                            }}
                            disabled={isSubmitting}
                        />
                    </div>
                </Field>
                <Field label="Warehouse" required>
                    <Select value={warehouse} onValueChange={setWarehouse} disabled={false}>
                        <SelectTrigger className="w-full">
                            <Warehouse size={14} className="text-muted-foreground mr-1"/>
                            <SelectValue placeholder="Select"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Available</SelectLabel>
                                <SelectItem value="GLPC">GLPC</SelectItem>
                                <SelectItem value="SMALL_P3">SMALL P3</SelectItem>
                                <SelectItem value="PNT">PNT</SelectItem>
                                <SelectItem value="P3">BIG P3</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
            </div>
        </div>

        <Separator/>
        <Button onClick={handleSubmit} disabled={isSubmitting || !canShowForm} className="w-full" size="lg">
            {isSubmitting
                ? <><Loader2 size={15} className="mr-2 animate-spin"/>Adding to stock…</>
                : <><PackagePlus size={15} className="mr-2"/>Add to Stock</>
            }
        </Button>
    </div>
);


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
    const store_stock_history_add = useStockStore(state => state.add_item_to_history);

    useEffect(() => {
        if (!selected) {
            setPicked_template(null);
            return;
        }
        if (!items_templates || !Array.isArray(items_templates)) {
            setPicked_template(null);
            return;
        }
        setIsLoadingTemplate(true);
        const id = setTimeout(() => {
            try {
                const found = items_templates.find(i => i?.material_number === selected);
                setPicked_template(found || null);
                if (!found) toast.error("Template not found for selected material");
            } catch {
                setPicked_template(null);
            } finally {
                setIsLoadingTemplate(false);
            }
        }, 100);
        return () => clearTimeout(id);
    }, [selected, items_templates]);

    const handleSubmit = async () => {
        try {
            const data = {
                card_id: user_store?.card_id,
                material_number: picked_template?.material_number,
                warehouse: warehouse,
                quantity: Number(quantity),
                location: location,
            }

            const history_response = await StockService.addStockHistory(data)
            store_stock_history_add(history_response);

            await StockService.addStockRecord(data)
            toast.success(`Item was successfully added to Stock`)

        } catch (err) {
            err && toast.error(err.toString());
        }
    };

    const canShowForm = location.trim().length > 0;

    const formProps = {
        location, setLocation, selected, setSelected,
        quantity, setQuantity, warehouse, setWarehouse,
        picked_template, isLoadingTemplate, isSubmitting,
        canShowForm, handleSubmit,
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="border-b bg-card px-4 sm:px-6 py-3 sm:py-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary/10">
                        <PackagePlus size={16} className="text-primary"/>
                    </div>
                    <div>
                        <h1 className="text-sm sm:text-base font-semibold leading-none">Add to Stock</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Register incoming materials to warehouse</p>
                    </div>
                </div>
            </div>

            {/* Mobile: Tabs */}
            <div className="flex-1 md:hidden overflow-hidden">
                <Tabs defaultValue="form" className="h-full flex flex-col">
                    <TabsList className="w-full rounded-none border-b h-10 bg-background shrink-0">
                        <TabsTrigger value="form" className="flex-1 gap-1.5 text-xs">
                            <PackagePlus size={13}/> Add Stock
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex-1 gap-1.5 text-xs">
                            <ClipboardList size={13}/> History
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="form" className="flex-1 overflow-auto mt-0">
                        <StockForm {...formProps}/>
                    </TabsContent>
                    <TabsContent value="history" className="flex-1 overflow-hidden mt-0 p-3">
                        <StockHistoryList/>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Desktop: Two columns */}
            <div className="hidden md:grid md:grid-cols-[520px_1fr] flex-1 overflow-hidden">
                <div className="border-r overflow-auto">
                    <StockForm {...formProps}/>
                </div>
                <div className="overflow-hidden p-4">
                    <StockHistoryList/>
                </div>
            </div>
        </div>
    );
};

export default Page;