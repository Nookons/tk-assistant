export const removeComment = async (comment_id: string) => {
    const res = await fetch(`/api/robots/remove-comment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            comment_id: comment_id
        })
    })

    if (!res.ok) throw new Error(`Could not remove comment with id: ${comment_id}`)
    return res.json();
};