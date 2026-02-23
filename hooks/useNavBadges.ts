import {useStockStore} from "@/store/stock";
import {useRobotsStore} from "@/store/robotsStore";

export const useNavBadges = (): Record<string, number | undefined> => {
    const stock_history = useStockStore(state => state.stock_history);
    const robots = useRobotsStore(state => state.robots);

    const offlineRobots = robots?.filter(r => r.status === "离线 | Offline").length;

    return {
        robots: offlineRobots || undefined,
        stock: 0 || undefined,
        employees: undefined,
    };
};