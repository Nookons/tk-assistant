'use client'
import React, { useEffect, useState } from 'react';
import AllPartsPicker from '@/components/shared/AllPartsPicker/AllPartsPicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserStore } from '@/store/user';
import { useStockStore } from '@/store/stock';
import { IStockItemTemplate } from '@/types/stock/StockItem';
import { toast } from 'sonner';
import { Loader2, PackagePlus, Warehouse, MapPin, Hash, ClipboardList } from 'lucide-react';
import StockItemPreview from '@/components/shared/Stock/StockItemPreview';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StockHistoryList from '@/components/shared/DashboardNew/DashboardComponents/Stock/StockHistoryList';
import { StockService } from '@/services/stockService';

// ─── Field wrapper ────────────────────────────────────────────────────────────

const Field = ({ label, required, hint, children }: {
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

// ─── Step header ──────────────────────────────────────────────────────────────

const Step = ({ n, label }: { n: number; label: string }) => (
    <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
            {n}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
);

// ─── Form ─────────────────────────────────────────────────────────────────────

const StockForm = ({ location, setLocation, selected, setSelected, quantity, setQuantity,
                       warehouse, setWarehouse, picked_template, isLoadingTemplate, isSubmitting, canShowForm, handleSubmit }: any) => (
    <div className="space-y-5 p-4 sm:p-5">

        {/* Step 1 — Location */}
        <div className="space-y-3">
            <Step n={1} label="Location" />

            <Field label="Storage Location Code" required hint="e.g. A123 for GLPC, PNT, SMALL P3…">
                <div className="relative my-2">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-2 font-mono uppercase"
                        placeholder="A123"
                        value={location}
                        onChange={e => setLocation(e.target.value.toUpperCase())}
                    />
                </div>
            </Field>
        </div>

        <Separator />

        {/* Step 2 — Material */}
        <div className={`space-y-3 transition-opacity ${canShowForm ? 'opacity-100' : 'opacity-40 pointer-events-none select-none'}`}>
            <Step n={2} label="Material" />
            {isLoadingTemplate ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" /> Loading template…
                </div>
            ) : (
                <Field label="Material Number" required>
                    <div className={`my-2`}>
                        <AllPartsPicker setSelected={setSelected} selected={selected} />
                    </div>
                </Field>
            )}
            {picked_template && <StockItemPreview data={picked_template} />}
            {selected && !picked_template && !isLoadingTemplate && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5">
                    <p className="text-sm text-destructive font-medium">Template not found</p>
                    <p className="text-xs text-destructive/70 mt-0.5">
                        No template for: <span className="font-mono">{selected}</span>
                    </p>
                </div>
            )}
        </div>

        <Separator />

        {/* Step 3 — Quantity & Warehouse */}
        <div className={`space-y-3 transition-opacity ${canShowForm ? 'opacity-100' : 'opacity-40 pointer-events-none select-none'}`}>
            <Step n={3} label="Quantity & Warehouse" />
            <div className="grid grid-cols-2 gap-3 ">
                <Field label="Quantity" required>
                    <div className="relative ">
                        <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-8 tabular-nums my-2"
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={quantity}
                            onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setQuantity(v); }}
                            disabled={isSubmitting}
                        />
                    </div>
                </Field>
                <Field label="Warehouse" required>
                    <Select value={warehouse} onValueChange={setWarehouse}>
                        <SelectTrigger className="w-full my-2">
                            <Warehouse size={14} className="text-muted-foreground mr-1" />
                            <SelectValue placeholder="Select" />
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

        <Separator />

        <Button onClick={handleSubmit} disabled={isSubmitting || !canShowForm} className="w-full" size="lg">
            {isSubmitting
                ? <><Loader2 size={15} className="mr-2 animate-spin" />Adding to stock…</>
                : <><PackagePlus size={15} className="mr-2" />Add to Stock</>
            }
        </Button>
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const InventoryDisplay = () => {
    const [selected, setSelected]           = useState('');
    const [location, setLocation]           = useState('');
    const [warehouse, setWarehouse]         = useState('GLPC');
    const [quantity, setQuantity]           = useState('');
    const [isSubmitting, setIsSubmitting]   = useState(false);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    const [picked_template, setPicked_template] = useState<IStockItemTemplate | null>(null);

    const user_store            = useUserStore(state => state.currentUser);
    const items_templates       = useStockStore(state => state.items_templates);
    const store_stock_history_add = useStockStore(state => state.add_item_to_history);

    useEffect(() => {
        if (!selected || !Array.isArray(items_templates)) {
            setPicked_template(null);
            return;
        }
        setIsLoadingTemplate(true);
        const id = setTimeout(() => {
            const found = items_templates.find(i => i?.material_number === selected) ?? null;
            setPicked_template(found);
            if (!found) toast.error('Template not found for selected material');
            setIsLoadingTemplate(false);
        }, 100);
        return () => clearTimeout(id);
    }, [selected, items_templates]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const data = {
                card_id:         user_store?.card_id,
                material_number: picked_template?.material_number,
                warehouse,
                quantity:        Number(quantity),
                location,
            };
            const history_response = await StockService.addStockHistory(data);
            store_stock_history_add(history_response);
            await StockService.addStockRecord(data);
            toast.success('Item was successfully added to Stock');
        } catch (err: any) {
            toast.error(err?.message ?? err?.toString());
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
        <div className="w-full flex flex-col overflow-hidden h-screen">

            {/* Header */}
            <div className="flex items-center gap-3 border-b px-4 py-3 sm:px-5 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <PackagePlus size={15} className="text-primary" />
                </div>
                <div>
                    <p className="text-sm font-semibold leading-none">Add to Stock</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Register incoming materials to warehouse</p>
                </div>
            </div>

            {/* Body: tabs on mobile, split on desktop */}
            <div className="flex-1 overflow-hidden">

                {/* ── Mobile ── */}
                <div className="md:hidden">
                    <Tabs defaultValue="form" className="flex flex-col">
                        <TabsList className="w-full rounded-none h-10 bg-muted/40 border-b shrink-0">
                            <TabsTrigger value="form" className="flex-1 gap-1.5 text-xs rounded-none">
                                <PackagePlus size={13} /> Add Stock
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex-1 gap-1.5 text-xs rounded-none">
                                <ClipboardList size={13} /> History
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="form" className="mt-0">
                            <StockForm {...formProps} />
                        </TabsContent>
                        <TabsContent value="history" className="mt-0 p-3">
                            <StockHistoryList />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* ── Desktop ── */}
                <div className="hidden md:grid md:grid-cols-[420px_1fr] h-full divide-x">
                    <div className="overflow-y-auto">
                        <StockForm {...formProps} />
                    </div>
                    <div className="overflow-y-auto p-4">
                        <StockHistoryList />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InventoryDisplay;