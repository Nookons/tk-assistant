import { create } from 'zustand'
import { IStockItemTemplate } from "@/types/stock/StockItem"
import {ISummaryItemStock, LocationItem, LocationStock, StockByLocationResponse} from "@/types/stock/SummaryItem"
import {IHistoryStockItem} from "@/types/stock/HistoryStock";

type UserState = {
    items_templates: IStockItemTemplate[] | null
    set_items_templates: (data: IStockItemTemplate[]) => void

    stock_summary: StockByLocationResponse | null
    set_stock_summary: (data: StockByLocationResponse) => void
    update_stock_location: (locationKey: string, data: LocationItem[]) => void

    stock_history: IHistoryStockItem[] | null
    set_stock_history: (data: IHistoryStockItem[]) => void

    add_item_template: (item: IStockItemTemplate) => void
    update_item_template: (id: string, updates: Partial<IStockItemTemplate>) => void
    delete_item_template: (id: string) => void
    get_item_template_by_id: (id: string) => IStockItemTemplate | undefined

    add_item_to_history: (item: IHistoryStockItem) => void
    delete_item_from_history: (id: string) => void
}

export const useStockStore = create<UserState>((set, get) => ({
    items_templates: null,
    stock_summary: null,
    stock_history: null,

    set_items_templates: (data) => set({ items_templates: data }),
    set_stock_summary: (data) => set({ stock_summary: data }),
    set_stock_history: (data) => set({ stock_history: data }),

    add_item_template: (item) =>
        set((state) => ({
            items_templates: [...(state.items_templates ?? []), item],
        })),

    update_item_template: (id, updates) =>
        set((state) => ({
            items_templates: state.items_templates?.map(item =>
                item.id.toString() === id ? { ...item, ...updates } : item
            ) ?? null
        })),

    delete_item_template: (id) =>
        set((state) => ({
            items_templates: state.items_templates?.filter(item => item.id.toString() !== id) ?? null
        })),

    get_item_template_by_id: (id) => {
        const { items_templates } = get()
        return items_templates?.find(item => item.id.toString() === id)
    },

    add_item_to_history: (item) =>
        set((state) => ({
            stock_history: [...(state.stock_history ?? []), item],
        })),

    delete_item_from_history: (id) =>
        set((state) => ({
            stock_history: state.stock_history?.filter(item => item.id.toString() !== id) ?? null
        })),

    update_stock_location: (locationKey: string, data: LocationItem[]) =>
        set((state) => {
            const exists = state.stock_summary?.some(s => s.location === locationKey);

            if (exists) {
                const updated = state.stock_summary!.map((locationStock) =>
                    locationStock.location === locationKey
                        ? { ...locationStock, items: data }
                        : locationStock
                );
                return { stock_summary: updated };
            } else {
                const newEntry: LocationStock = { location: locationKey, items: data };
                return { stock_summary: [...(state.stock_summary ?? []), newEntry] };
            }
        }),
}))