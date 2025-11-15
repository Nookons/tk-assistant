import { create } from 'zustand'
import { IShift } from "@/types/shift/shift";

type ShiftsState = {
    employee_shifts: IShift[] | null
    all_shifts: IShift[] | null
    set_employee_shifts: (shifts: IShift[]) => void
    set_all_shifts: (shifts: IShift[]) => void
    remover_shift: (id: number) => void
}

export const useShiftsStore = create<ShiftsState>((set) => ({
    employee_shifts: null,
    all_shifts: null,

    set_employee_shifts: (shifts) => set({
        employee_shifts: shifts
    }),

    set_all_shifts: (shifts) => set({
        all_shifts: shifts
    }),

    remover_shift: (shift_id) => set((state) => ({
        all_shifts: state.all_shifts?.filter(shift => shift.id !== shift_id) || null,
        employee_shifts: state.employee_shifts?.filter(shift => shift.id !== shift_id) || null
    }))
}));
