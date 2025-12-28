export const getEmployeesList = async () => {
    const res = await fetch(`/api/user/get-employees-list`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json()
};