'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Hash, Loader2, MapPin, PackagePlus, Warehouse } from 'lucide-react';

import AllPartsPicker from '@/components/shared/AllPartsPicker/AllPartsPicker';
import StockItemPreview from '@/components/shared/Stock/StockItemPreview';
import StockHistoryList from '@/components/shared/DashboardNew/DashboardComponents/Stock/StockHistoryList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectGroup,
    SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { StockService } from '@/services/stockService';
import { useStockStore } from '@/store/stock';
import { useUserStore } from '@/store/user';
import { IStockItemTemplate } from '@/types/stock/StockItem';
import { toast } from 'sonner';
import {WAREHOUSES} from "@/lib/Warehouses";
import {useSessionStore} from "@/store/session";
import {IUserSession} from "@/types/Session/Session";


const TEMPLATE_DEBOUNCE_MS = 100;


interface StockFormValues {
    location:  string;
    selected:  string;
    quantity:  string;
    session:  IUserSession | null;
}

interface StockFormHandlers {
    onLocationChange:  (v: string) => void;
    onSelectedChange:  (v: string) => void;
    onQuantityChange:  (v: string) => void;
    onSubmit:          () => void;
}

interface StockFormState {
    pickedTemplate:    IStockItemTemplate | null;
    isLoadingTemplate: boolean;
    isSubmitting:      boolean;
    canInteract:       boolean;
}

type StockFormProps = StockFormValues & StockFormHandlers & StockFormState;


interface FieldProps {
    label:     string;
    required?: boolean;
    hint?:     string;
    children:  React.ReactNode;
}

const Field = ({ label, required, hint, children }: FieldProps) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium leading-none">
            {label}
            {required && (
                <span className="text-destructive ml-1" aria-hidden="true">*</span>
            )}
        </label>
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
);

// ─── Step indicator ───────────────────────────────────────────────────────────

const Step = ({ n, label }: { n: number; label: string }) => (
    <div className="flex items-center gap-2">
        <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted
                       text-[11px] font-bold text-muted-foreground"
            aria-hidden="true"
        >
            {n}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
        </span>
    </div>
);

// ─── Template not found banner ────────────────────────────────────────────────

const TemplateNotFound = ({ materialNumber }: { materialNumber: string }) => (
    <div
        role="alert"
        className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5"
    >
        <p className="text-sm font-medium text-destructive">Template not found</p>
        <p className="text-xs text-destructive/70 mt-0.5">
            No template for: <span className="font-mono">{materialNumber}</span>
        </p>
    </div>
);

// ─── Stock form ───────────────────────────────────────────────────────────────

const StockForm = ({
                       location, onLocationChange,
                       selected, onSelectedChange,
                       quantity, onQuantityChange,
                       pickedTemplate, isLoadingTemplate,
                       isSubmitting, canInteract,
                       onSubmit, session
                   }: StockFormProps) => {

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (v === '' || /^\d+$/.test(v)) onQuantityChange(v);
    };

    return (
        <div className="space-y-5 p-4 sm:p-5">

            <section className="space-y-3" aria-label="Step 1: Location">
                <Step n={1} label="Location" />
                <Field
                    label="Storage Location Code"
                    required
                    hint="e.g. A123 for GLPC, PNT, SMALL P3…"
                >
                    <div className="relative mt-2">
                        <MapPin
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                            aria-hidden="true"
                        />
                        <Input
                            className="pl-8 font-mono uppercase"
                            placeholder="A123"
                            value={location}
                            onChange={e => onLocationChange(e.target.value.toUpperCase())}
                            autoComplete="off"
                            aria-label="Storage location code"
                        />
                    </div>
                </Field>
            </section>

            <Separator />

            <section
                aria-label="Step 2: Material"
                aria-disabled={!canInteract}
                className={`space-y-3 transition-opacity duration-200 ${
                    canInteract ? 'opacity-100' : 'opacity-40 pointer-events-none select-none'
                }`}
            >
                <Step n={2} label="Material" />

                {isLoadingTemplate ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                        <span>Loading template…</span>
                    </div>
                ) : (
                    <Field label="Material Number" required>
                        <div className="mt-2">
                            <AllPartsPicker setSelected={onSelectedChange} selected={selected} />
                        </div>
                    </Field>
                )}

                {pickedTemplate && <StockItemPreview data={pickedTemplate} />}

                {selected && !pickedTemplate && !isLoadingTemplate && (
                    <TemplateNotFound materialNumber={selected} />
                )}
            </section>

            <Separator />

            <section
                aria-label="Step 3: Quantity and Warehouse"
                aria-disabled={!canInteract}
                className={`space-y-3 transition-opacity duration-200 ${
                    canInteract ? 'opacity-100' : 'opacity-40 pointer-events-none select-none'
                }`}
            >
                <Step n={3} label="Quantity & Warehouse" />

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Quantity" required>
                        <div className="relative mt-2">
                            <Hash
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                aria-hidden="true"
                            />
                            <Input
                                className="pl-8 tabular-nums"
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={quantity}
                                onChange={handleQuantityChange}
                                disabled={isSubmitting}
                                aria-label="Quantity"
                            />
                        </div>
                    </Field>
                    <Field label="Save">
                        <div className={`mt-1`}>
                            <Button
                                onClick={onSubmit}
                                disabled={isSubmitting || !canInteract}
                                className="w-full"
                                size="lg"
                                aria-busy={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={15} className="mr-2 animate-spin" aria-hidden="true" />
                                        Adding to stock…
                                    </>
                                ) : (
                                    <>
                                        <PackagePlus size={15} className="mr-2" aria-hidden="true" />
                                        Add to Stock
                                    </>
                                )}
                            </Button>
                            <div className={`text-right mt-2`}>
                                <p className={`text-xs`}>{session?.warehouse.address}</p>
                                <p className={`text-xs`}>{session?.user.user_name} - {session?.user.card_id}</p>
                                <p className={`text-xs`}>{session?.warehouse.title}</p>
                            </div>
                        </div>
                    </Field>
                </div>
            </section>
        </div>
    );
};

// ─── Page header ──────────────────────────────────────────────────────────────

const PageHeader = () => (
    <header className="flex items-center gap-3 border-b px-4 py-3 sm:px-5 shrink-0">
        <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"
            aria-hidden="true"
        >
            <PackagePlus size={15} className="text-primary" />
        </div>
        <div>
            <p className="text-sm font-semibold leading-none">Add to Stock</p>
            <p className="text-xs text-muted-foreground mt-0.5">
                Register incoming materials to warehouse
            </p>
        </div>
    </header>
);


const InventoryDisplay = () => {
    const session = useSessionStore(state => state.currentSession)

    const [selected,  setSelected]  = useState('');
    const [location,  setLocation]  = useState('');
    const [quantity,  setQuantity]  = useState('');

    const [isSubmitting,      setIsSubmitting]      = useState(false);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    const [pickedTemplate,    setPickedTemplate]    = useState<IStockItemTemplate | null>(null);

    const currentUser      = useUserStore(state => state.currentUser);
    const itemsTemplates   = useStockStore(state => state.items_templates);
    const addItemToHistory = useStockStore(state => state.add_item_to_history);


    useEffect(() => {
        if (!selected || !Array.isArray(itemsTemplates)) {
            setPickedTemplate(null);
            return;
        }

        setIsLoadingTemplate(true);
        const timer = setTimeout(() => {
            const found = itemsTemplates.find(i => i?.material_number === selected) ?? null;
            setPickedTemplate(found);
            if (!found) toast.error('Template not found for selected material');
            setIsLoadingTemplate(false);
        }, TEMPLATE_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [selected, itemsTemplates]);


    const handleSubmit = useCallback(async () => {
        if (!pickedTemplate) return;
        if (!session) return;
        if (!currentUser) return;

        setIsSubmitting(true);
        try {
            const payload = {
                card_id:         session.user.card_id,
                material_number: pickedTemplate.material_number,
                warehouse:       session.warehouse.title,
                quantity:        Number(quantity),
                location,
            };

            const historyItem = await StockService.addStockHistory(payload);
            addItemToHistory(historyItem);
            await StockService.addStockRecord(payload);

            toast.success('Item was successfully added to Stock');
            setSelected('');
            setQuantity('');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : String(err));
        } finally {
            setIsSubmitting(false);
        }
    }, [pickedTemplate, currentUser, session, quantity, location, addItemToHistory]);


    const canInteract = location.trim().length > 0;

    const formProps: StockFormProps = {
        location,  onLocationChange:  setLocation,
        selected,  onSelectedChange:  setSelected,
        quantity,  onQuantityChange:  setQuantity,
        pickedTemplate,
        isLoadingTemplate,
        isSubmitting,
        canInteract,
        onSubmit: handleSubmit,
        session: session
    };

    return (
        <div className="flex flex-col h-dvh w-full overflow-hidden">
            <PageHeader />

            <div className="flex-1 min-h-0">

                <div className="md:hidden flex flex-col h-full">
                    <Tabs defaultValue="form" className="flex flex-col h-full">
                        <TabsList className="w-full rounded-none h-10 bg-muted/40 border-b shrink-0">
                            <TabsTrigger
                                value="form"
                                className="flex-1 gap-1.5 text-xs rounded-none"
                            >
                                <PackagePlus size={13} aria-hidden="true" />
                                Add Stock
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="flex-1 gap-1.5 text-xs rounded-none"
                            >
                                <ClipboardList size={13} aria-hidden="true" />
                                History
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="form"
                            className="flex-1 min-h-0 overflow-y-auto mt-0"
                        >
                            <StockForm {...formProps} />
                        </TabsContent>

                        <TabsContent
                            value="history"
                            className="flex-1 min-h-0 overflow-y-auto mt-0 p-3"
                        >
                            <StockHistoryList isShort />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="hidden md:grid md:grid-cols-[520px_1fr] h-full divide-x">
                    <div className="overflow-y-auto">
                        <StockForm {...formProps} />
                    </div>
                    <div className="overflow-y-auto p-4">
                        <StockHistoryList isShort />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InventoryDisplay;