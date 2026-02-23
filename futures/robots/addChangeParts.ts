import {ParamValue} from "next/dist/server/request/params";

interface props {
    parts_numbers: string[];
    card_id:   number;
    robot_id:  number;
    warehouse: string;
    location:  string;
    quantity: number;
}

export const addChangeParts = async ({data}: {data: props}) => {
    if (!data) return;

    const res = await fetch(`/api/robots/add-change-parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to add robot');
    }

    await fetch(`/api/user/update-user-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            card_id: data.card_id,
            value: Number(0.5),
        })
    })

    return await res.json(); // если хочешь вернуть данные
}