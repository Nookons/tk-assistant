import {ILocalIssue} from "@/app/exceptions-parsing/page";

export const addNotes = async ({add_by, date, note}: {add_by: number, date: Date, note: string}) => {
    if (!add_by) return;

    const res = await fetch(`/api/important/add-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            add_by, date, note
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to add robot');
    }

    return await res.json(); // если хочешь вернуть данные
}