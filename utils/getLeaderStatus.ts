
export const getLeaderStatus = (position: string): boolean => {
    if (position.toLowerCase().includes("leader"))  return true;
    return false;
};