import {ILocalIssue} from "@/types/Exception/ExceptionParse";

export const addNewException = async ({data}: {data: ILocalIssue}) => {
    if (!data) return;

    const res = await fetch(`/api/exception/add-new-exception`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...data}),
    });

    if (!res.ok) {
        throw new Error('Failed to add robot');
    }

    const res_score = await fetch(`/api/user/update-user-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            card_id: data.add_by,
            value: 0.01,
        })
    })

    if (!res_score.ok) {
        throw new Error('Failed to update score');
    }

    return await res.json(); // если хочешь вернуть данные
}