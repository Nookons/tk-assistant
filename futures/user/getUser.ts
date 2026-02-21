
export const getUserByAuthId = async (auth_id : string) => {
    try {
        const res = await fetch(`/api/user/get-user-by-auth-id?auth_id=${auth_id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            }
        });


        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json(); // исправлено
        return result
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        return null;
    }
};