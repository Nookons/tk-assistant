import { create } from 'zustand'
import {IChangeRecord} from "@/types/Parts/ChangeRecord";

type UserState = {
    parts_templates: IChangeRecord[] | null
    set_parts_templates: (data: IChangeRecord[]) => void
}

export const usePartsStore = create<UserState>((set) => ({
    parts_templates: null,

    set_parts_templates: (data) => set({ parts_templates: data }),
}))
