
export const robotUpdate = async (
    {card_id, robot_id, type_problem, problem_note}:
    {card_id: number, robot_id: number, type_problem: string, problem_note: string}
) => {

    console.log(type_problem);

    const res = await fetch(`/api/robots/update-robot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            card_id: card_id,
            robot_id: robot_id,
            updateFields: {
                type_problem: type_problem,
                problem_note: problem_note,
            }
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to add robot');
    }

    return await res.json(); // если хочешь вернуть данные
}