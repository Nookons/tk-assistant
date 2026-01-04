import dayjs from "dayjs";


export const timeToString = (time: number) => {
    return dayjs(time).format('HH:mm · MMM D, YYYY')
}