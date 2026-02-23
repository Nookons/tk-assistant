
export const getInitialShift = (): 'day' | 'night' => {
    const hour = new Date().getHours();
    return (hour >= 18 || hour < 6) ? 'night' : 'day';
};

export const getInitialShiftByTime = (date: Date): 'day' | 'night' => {
    const hour = new Date(date).getHours();
    return (hour >= 18 || hour < 6) ? 'night' : 'day';
};
