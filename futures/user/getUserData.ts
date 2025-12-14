import {ParamValue} from "next/dist/server/request/params";

export const getUserData = async (card_id: ParamValue) => {
    try {
        const res = await fetch(`/api/user/get-user-by-phone?phone=${card_id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return await res.json()
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        return null;
    }
};