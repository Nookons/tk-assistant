import {IRobotException} from "@/types/Exception/Exception";

export async function getMonthExceptions(month: string): Promise<IRobotException[]> {
    const response = await fetch(`/api/exception/get-month-data?month=${month}`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}