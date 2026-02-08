import { create } from 'zustand'
import { IStockItemTemplate } from "@/types/stock/StockItem"
import { StockByLocationResponse } from "@/types/stock/SummaryItem"

type UserState = {
    items_templates: IStockItemTemplate[] | null
    set_items_templates: (data: IStockItemTemplate[]) => void

    stock_summary: StockByLocationResponse | null
    set_stock_summary: (data: StockByLocationResponse) => void

    add_item_template: (item: IStockItemTemplate) => void
    update_item_template: (id: string, updates: Partial<IStockItemTemplate>) => void
    delete_item_template: (id: string) => void
    get_item_template_by_id: (id: string) => IStockItemTemplate | undefined
}

export const useStockStore = create<UserState>((set, get) => ({
    items_templates: null,
    stock_summary: null,

    set_items_templates: (data) => set({ items_templates: data }),
    set_stock_summary: (data) => set({ stock_summary: data }),

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
    }
}))