import dayjs from "dayjs";

export const getWorkDate = (d: Date | undefined): Date => {
    const date = dayjs(d);
    const hour = date.hour();

    // Если время от 00:00 до 05:59, считаем, что это еще предыдущий день
    if (hour < 6) {
        return date.subtract(1, 'day').toDate();
    }

    return date.toDate();
};
