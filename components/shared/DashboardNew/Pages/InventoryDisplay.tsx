'use client'
import React, {useEffect, useState} from 'react';
import AllPartsPicker from "@/components/shared/AllPartsPicker/AllPartsPicker";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useUserStore} from "@/store/user";
import {useStockStore} from "@/store/stock";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {toast} from "sonner";
import {AddToStock} from "@/futures/stock/AddToStock";
import {AddToStockHistory} from "@/futures/stock/AddToStockHistory";
import {Loader2, Package, PackagePlus, Warehouse, MapPin, Hash, ClipboardList} from "lucide-react";
import StockItemPreview from "@/components/shared/Stock/StockItemPreview";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {ButtonGroup} from "@/components/ui/button-group";
import {Pencil, Trash2} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {StockService} from "@/services/stockService";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {timeToString} from "@/utils/timeToString";
import dayjs from "dayjs";
import {Separator} from "@/components/ui/separator";
import {getUserWarehouse} from "@/utils/getUserWarehouse";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";


const StockHistoryList = () => {
    const user = useUserStore(state => state.currentUser);
    const warehouse = getUserWarehouse(user?.warehouse || "");
    const stock_history = useStockStore(state => state.stock_history);
    const delete_item_from_history = useStockStore(state => state.delete_item_from_history);

    const handleRemove = useMutation({
        mutationFn: (data: IHistoryStockItem) => StockService.removeHistoryItem(data),
        onSuccess: (deletedItem) => {
            if (delete_item_from_history) delete_item_from_history(deletedItem.id.toString());
            toast.success("Entry removed");
        },
        onError: () => toast.error("Failed to remove entry"),
    });

    const handleDelete = (item: IHistoryStockItem) => {
        if (window.confirm('Remove this entry?')) handleRemove.mutate(item);
    };

    if (!stock_history) return null;

    const sorted = [...stock_history.filter(robot => warehouse.toLowerCase() === 'leader' || robot.warehouse === warehouse)]
        .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
        .slice(0, 25);

    return (
        <div className="rounded-xl border bg-card overflow-hidden h-full flex flex-col">
            <div>
                <p className={`px-4 py-2 text-xs font-medium text-muted-foreground`}>In this section, you will find historical data exclusively for the warehouse in which you are currently working.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30 shrink-0">
                <ClipboardList size={15} className="text-muted-foreground"/>
                <span className="text-sm font-medium">Recent Entries</span>
                <Badge variant="secondary" className="ml-auto text-xs">{sorted.length}</Badge>
            </div>
            <div className="overflow-auto flex-1">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs w-[80px]">Actions</TableHead>
                            <TableHead className="text-xs">Employee</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Warehouse</TableHead>
                            <TableHead className="text-xs hidden md:table-cell">Location</TableHead>
                            <TableHead className="text-xs">Qty</TableHead>
                            <TableHead className="text-xs">Material</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                    <Package size={24} className="mx-auto mb-2 opacity-30"/>
                                    No entries yet for {warehouse}
                                </TableCell>
                            </TableRow>
                        )}
                        {sorted.map((el) => (
                            <TableRow key={el.id} className={el.value < 0 ? "bg-destructive/5 hover:bg-destructive/10" : ""}>
                                <TableCell>
                                    <ButtonGroup>
                                        <Button variant="secondary" size="sm" disabled={handleRemove.isPending}>
                                            <Pencil size={13}/>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(el)}
                                            disabled={handleRemove.isPending}
                                        >
                                            <Trash2 size={13}/>
                                        </Button>
                                    </ButtonGroup>
                                </TableCell>
                                <TableCell className="text-sm font-medium">{el.user.user_name}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <Badge variant="outline" className="text-xs font-mono">{el.warehouse}</Badge>
                                </TableCell>
                                <TableCell className="text-sm font-mono text-muted-foreground hidden md:table-cell">{el.location}</TableCell>
                                <TableCell className={`text-sm font-semibold tabular-nums ${el.value < 0 ? "text-destructive" : "text-emerald-500"}`}>
                                    {el.value > 0 ? `+${el.value.toLocaleString()}` : el.value.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-sm font-mono text-muted-foreground max-w-[100px] truncate">{el.material_number}</TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                                    {timeToString(dayjs(el.created_at).valueOf())}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};


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
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">1</div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</span>
            </div>
            <Field label="Storage Location Code" required hint="Enter the storage location code for GLPC, PNT, SMALL P3…">
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
        <div className={`space-y-4 transition-opacity ${canShowForm ? "opacity-100" : "opacity-40 pointer-events-none select-none"}`}>
            <Separator/>
            <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">2</div>
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
                    <p className="text-xs text-destructive/70 mt-0.5">No template for: <span className="font-mono">{selected}</span></p>
                </div>
            )}
        </div>

        {/* Step 3 */}
        <div className={`space-y-4 transition-opacity ${canShowForm ? "opacity-100" : "opacity-40 pointer-events-none select-none"}`}>
            <Separator/>
            <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">3</div>
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
    const add_new = useStockStore(state => state.add_item_to_history);

    useEffect(() => {
        if (!selected) { setPicked_template(null); return; }
        if (!items_templates || !Array.isArray(items_templates)) { setPicked_template(null); return; }
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

    const validateForm = () => {
        if (!user_store)      { toast.error("User not found. Please log in."); return false; }
        if (!picked_template) { toast.error("Please select a material"); return false; }
        if (!warehouse)       { toast.error("Please select a warehouse"); return false; }
        if (!quantity || parseInt(quantity) <= 0) { toast.error("Please enter a valid quantity"); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const data = {
                id: dayjs().valueOf(),
                card_id: user_store!.card_id.toString(),
                material_number: picked_template!.material_number,
                location_key: `${warehouse.toLowerCase()}-${location.toLowerCase()}`,
                warehouse, location, quantity,
            };
            await AddToStock(data);
            const history_response = await AddToStockHistory(data);
            add_new({
                ...data,
                id: history_response.id.toString(),
                value: Number(quantity),
                created_at: dayjs().toDate(),
                add_by: user_store?.card_id || 0,
                user: user_store!,
            });
            toast.success("Added to stock", {
                description: `${quantity} units of ${picked_template!.material_number}`
            });
            setQuantity("");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to add to stock");
        } finally {
            setIsSubmitting(false);
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