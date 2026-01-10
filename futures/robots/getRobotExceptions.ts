import {IRobotException} from "@/types/Exception/Exception";

export const getRobotExceptions = async (robot_number: string): Promise<IRobotException[]> => {
    const res = await fetch(`/api/robots/get-robot-exceptions?robot_number=${robot_number}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error(`Could not get all shifts (status: ${res.status})`);
    }

    return await res.json();
}