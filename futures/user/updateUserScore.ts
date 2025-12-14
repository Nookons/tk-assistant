
export const updateUserScore = async (card_id: number, score: number) => {

    const res_user = await fetch(`/api/user/update-user-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id, value: 0.15}),
    });

    if (!res_user.ok) {
        throw new Error('Failed to update user score');
    }
}