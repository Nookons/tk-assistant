export const getEmployeeShifts = async (card_id: string | string[]) => {
    const res = await fetch(`/api/shifts/get-employee-shifts?card_id=${card_id}`, {
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
