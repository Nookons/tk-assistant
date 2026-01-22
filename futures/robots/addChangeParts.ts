import {ParamValue} from "next/dist/server/request/params";

export const addChangeParts = async ({parts, card_id, robot_id}: {parts: string[], card_id: ParamValue | number, robot_id: number}) => {
    if (!parts) return;

    const res = await fetch(`/api/robots/add-change-parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            parts: parts,
            card_id: card_id,
            robot_id: robot_id
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to add robot');
    }

    await fetch(`/api/user/update-user-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            card_id,
            value: Number(0.5),
        })
    })

    return await res.json(); // если хочешь вернуть данные
}