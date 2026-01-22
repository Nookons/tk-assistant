
export const updateUserScoreByName = async (employee: string, score: number) => {

    const res_user = await fetch(`/api/user/update-user-score-by-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_n: employee, value: score}),
    });

    if (!res_user.ok) {
        throw new Error('Failed to update user score');
    }
}