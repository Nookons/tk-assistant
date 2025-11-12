export const getAllShifts = async () => {
    const res = await fetch(`/api/shifts/get-all-shifts?card_id=70072001`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error(`Could not get all shifts (status: ${res.status})`);
    }

    const response = await res.json();
    console.log(response);
    return response; // optional but usually useful
};
