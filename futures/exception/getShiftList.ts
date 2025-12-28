export const getShiftList = async ({date, shift_type}: {date: Date | undefined; shift_type: 'day' | 'night'}) => {

    const res = await fetch(`/api/exception/get-shift-list?date=${date}&shift=${shift_type}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error(`Could not get all shifts (status: ${res.status})`);
    }

    return await res.json();
};
