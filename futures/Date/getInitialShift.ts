
export const getInitialShift = (): 'day' | 'night' => {
    const hour = new Date().getHours();
    return (hour >= 18 || hour < 6) ? 'night' : 'day';
};