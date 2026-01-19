import {IRobotException} from "@/types/Exception/Exception";

export async function getAllExceptions(): Promise<IRobotException[]> {
    const response = await fetch(`/api/exception/get-all-exceptions`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}