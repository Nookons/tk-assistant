
export const getChangedParts = async (robot_id: number) => {
    const res = await fetch(`/api/robots/get-changed-parts?robot_id=${robot_id}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error(`Could not get all shifts (status: ${res.status})`);
    }

    const response = await res.json();
    return response; // optional but usually useful
}