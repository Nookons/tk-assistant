import {IChangeStatusRobot} from "@/types/Status/Status";

export const getStatusChanges = async (date: string, shift: string): Promise<IChangeStatusRobot[]> => {
    const res = await fetch(`/api/robots/get-status-changes-shift?date=${date}&shift=${shift}`, {
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
