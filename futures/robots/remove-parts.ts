export const removeParts = async (parts_id: string) => {
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
    return res.json();
};