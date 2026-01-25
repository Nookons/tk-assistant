import { create } from 'zustand'
import {IUser, IUserApiResponse} from '@/types/user/user'
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {IStockAmountItem} from "@/types/stock/StockAmounts";

type UserState = {
    items_templates: IStockItemTemplate[] | null
    set_items_templates: (data: IStockItemTemplate[]) => void

    stock_summary: IStockAmountItem[] | null
    set_stock_summary: (data: IStockAmountItem[]) => void
}

export const useStockStore = create<UserState>((set) => ({
    items_templates: null,
    stock_summary: null,

    set_items_templates: (data) => set({ items_templates: data }),
    set_stock_summary: (data) => set({ stock_summary: data }),
}))
