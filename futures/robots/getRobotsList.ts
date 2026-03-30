import {IUserSession} from "@/types/Session/Session";

export const getRobotsList = async (session: IUserSession | null) => {
    if (!session) throw new Error("Session not found");

    const res = await fetch(`/api/robots/get-robots-list?warehouse=${session.warehouse.title}`, {
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
