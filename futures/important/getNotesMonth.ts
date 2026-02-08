import {NoteItem} from "@/types/Important/Important";

export const getNotesMonth = async (month: string): Promise<NoteItem[]> => {
    const response = await fetch(`/api/important/get-notes-month?month=${month}`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}