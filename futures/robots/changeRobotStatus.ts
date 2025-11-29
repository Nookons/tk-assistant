
interface ILocalData {
    id: number;
    new_status: string;
    card_id: number;
}

export const changeRobotStatus = async ({data}: {data: ILocalData}) => {

    const res = await fetch(`/api/robots/status-update`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: data.id,
            new_status: data.new_status,
            card_id: data.card_id,
        })
    });

    if (!res.ok) {
        throw new Error(`Could not update robot status. (status: ${res.status})`);
    }

    const response = await res.json();
    return response; // optional but usually useful
};
