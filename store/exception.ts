import { create } from 'zustand';
import {IRobotException} from "@/types/Exception/Exception";

interface ExceptionStore {
    today_exception: IRobotException[] ;
    set_today_exception: (exception: IRobotException[]) => void;
    remove_exception: (id: number) => void;
}

export const useExceptionStore = create<ExceptionStore>((set) => ({
    today_exception: [],

    set_today_exception: (data: IRobotException[]) => {
        set({ today_exception: data });
    },

    remove_exception: (id: number) => {
        set((state) => ({
            today_exception: state.today_exception
                ? state.today_exception.filter(item => item.id !== id)
                : state.today_exception
        }));
    }
}));


