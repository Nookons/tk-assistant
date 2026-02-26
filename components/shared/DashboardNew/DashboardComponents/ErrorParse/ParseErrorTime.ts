import dayjs from "dayjs";

export const parseErrorTime = (errorTime: string, currentTime: dayjs.Dayjs): dayjs.Dayjs => {
    if (!errorTime || !errorTime.includes(':')) {
        return currentTime.second(0); // fallback — текущее время
    }

    const [errorHour, errorMinute] = errorTime.split(':').map(Number);
    const currentHour = currentTime.hour();

    if (isNaN(errorHour) || isNaN(errorMinute)) {
        return currentTime.second(0);
    }

    if (currentHour >= 0 && currentHour < 6 && errorHour >= 18 && errorHour < 24) {
        return currentTime.subtract(1, 'day').hour(errorHour).minute(errorMinute).second(0);
    }

    return currentTime.hour(errorHour).minute(errorMinute).second(0);
};