
export const getUserData = async ({user_phone} : {user_phone: string}) => {
    try {
        const res = await fetch(`/api/user/get-user-by-phone?phone=${user_phone}`, {
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