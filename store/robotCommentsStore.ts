import { create } from 'zustand'
import {IComment} from "@/store/robotsStore";

type UserState = {
    comments: IComment[] | null
    set_comments: (data: IComment[]) => void
}

export const useCommentsStore = create<UserState>((set) => ({
    comments: null,
    set_comments: (data) => set({ comments: data }),
}))
