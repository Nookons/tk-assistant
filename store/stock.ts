import { create } from 'zustand'
import {IUser, IUserApiResponse} from '@/types/user/user'
import {IStockItemTemplate} from "@/types/stock/StockItem";

type UserState = {
    items_templates: IStockItemTemplate[] | null
    set_items_templates: (data: IStockItemTemplate[]) => void
}

export const useStockStore = create<UserState>((set) => ({
    items_templates: null,

    set_items_templates: (data) => set({ items_templates: data }),
}))
