import { create } from 'zustand'
import { IStockItemTemplate } from "@/types/stock/StockItem"
import { IStockAmountItem } from "@/types/stock/StockAmounts"
import {StockByLocationResponse} from "@/types/stock/SummaryItem";

type UserState = {
    items_templates: IStockItemTemplate[] | null
    set_items_templates: (data: IStockItemTemplate[]) => void

    stock_summary: StockByLocationResponse | null
    set_stock_summary: (data: StockByLocationResponse) => void

    add_item_template: (item: IStockItemTemplate) => void
}

export const useStockStore = create<UserState>((set) => ({
    items_templates: null,
    stock_summary: null,

    set_items_templates: (data) => set({ items_templates: data }),
    set_stock_summary: (data) => set({ stock_summary: data }),

    add_item_template: (item) =>
        set((state) => ({
            items_templates: [...(state.items_templates ?? []), item],
        })),
}))
