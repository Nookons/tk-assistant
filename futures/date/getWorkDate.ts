import dayjs from "dayjs";

export const getWorkDate = (d: Date | undefined): Date => {
    const date = dayjs(d);
    const hour = date.hour();

    if (hour < 6) {
        return date.subtract(1, 'day').toDate();
    }

    return date.toDate();
};
