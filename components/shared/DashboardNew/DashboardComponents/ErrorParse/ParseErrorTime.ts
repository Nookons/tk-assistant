import dayjs from "dayjs";

export const parseErrorTime = (errorTime: string, currentTime: dayjs.Dayjs): dayjs.Dayjs => {
    const [errorHour, errorMinute] = errorTime.split(':').map(Number);
    const currentHour = currentTime.hour();

    // Если сейчас ночная смена (00:00-06:00) и ошибка была вечером (18:00-00:00)
    if (currentHour >= 0 && currentHour < 6 && errorHour >= 18 && errorHour < 24) {
        return currentTime.subtract(1, 'day').hour(errorHour).minute(errorMinute).second(0);
    }

    return currentTime.hour(errorHour).minute(errorMinute).second(0);
};