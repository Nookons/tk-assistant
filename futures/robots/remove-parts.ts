export const removeParts = async (parts_id: string, card_id: string) => {

    if (!card_id) throw new Error(`No card_id provided`)

    const res = await fetch(`/api/robots/remove-parts`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parts_id: parts_id
        })
    })

    if (!res.ok) throw new Error(`Could not remove parts with id: ${parts_id}`)

    await fetch(`/api/user/update-user-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            card_id,
            value: Number(-0.5),
        })
    })

    return res.json();
};