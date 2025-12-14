

export const changeRobotStatus = async (
    {robot_id, card_id, new_status, old_status, robot_number}:
    {robot_id: number, card_id: number, new_status: string, old_status: string, robot_number: number}) =>
{
    const res = await fetch(`/api/robots/status-update`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            card_id: card_id,
            robot_number: robot_number,
            robot_id: robot_id,
            new_status,
            old_status
        })
    });

    if (!res.ok) {
        throw new Error(`Could not update robot status. (status: ${res.status})`);
    }

    return await res.json(); // optional but usually useful
};
