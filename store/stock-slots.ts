import { create } from 'zustand';
import { IStockLocationSlot } from "@/types/stock/StockItem";

interface StockSlots {
    stock_slots: IStockLocationSlot[];
    set_stock_slots: (data: IStockLocationSlot[]) => void;
    remove_exception: (id: number) => void;
    update_stock_slot: (updated: IStockLocationSlot) => void;
    add_stock_slot: (slot: IStockLocationSlot) => void;
}

export const useStockSlots = create<StockSlots>((set, get) => ({
    stock_slots: [],

    set_stock_slots: (data: IStockLocationSlot[]) => {
        set({ stock_slots: data });
    },

    remove_exception: (id: number) => {
        set((state) => ({
            stock_slots: state.stock_slots.filter(item => item.id !== id)
        }));
    },

    update_stock_slot: (updated: IStockLocationSlot) => {
        set((state) => {
            const exists = state.stock_slots.some(slot => slot.id === updated.id);
            return {
                stock_slots: exists
                    ? state.stock_slots.map(slot => slot.id === updated.id ? updated : slot)
                    : [...state.stock_slots, updated],
            };
        });
    },

    add_stock_slot: (slot: IStockLocationSlot) => {
        const exists = get().stock_slots.some(s => s.id === slot.id);
        if (exists) {
            get().update_stock_slot(slot);
            return;
        }
        set((state) => ({ stock_slots: [...state.stock_slots, slot] }));
    },
}));