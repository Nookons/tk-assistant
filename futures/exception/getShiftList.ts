import dayjs from "dayjs";
import {IRobotException} from "@/types/Exception/Exception";

export async function getShiftList({ date, shift_type }: { date: Date | string, shift_type: 'day' | 'night' }): Promise<IRobotException[]> {
    const dateStr = date instanceof Date ? dayjs(date).format('YYYY-MM-DD') : date;

    console.log('getShiftList called with dateStr:', dateStr, 'shift:', shift_type);

    const response = await fetch(`/api/exception/get-shift-list?date=${dateStr}&shift=${shift_type}`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}