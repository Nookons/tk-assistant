export const removeShift = async (shift_id: number) => {
    const res = await fetch(`/api/shifts/remove-shift`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            shift_id: shift_id
        })
    });

    if (!res.ok) {
        throw new Error(`Could not get all shifts (status: ${res.status})`);
    }

    const response = await res.json();
    console.log(response);
    return response; // optional but usually useful
};
