
export const getChangeRecord = async (id: string) => {
    const res = await fetch(`/api/parts/get-change-record?id=${id}`, {
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
