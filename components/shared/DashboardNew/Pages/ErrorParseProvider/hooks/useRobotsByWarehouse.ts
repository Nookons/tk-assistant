import { useMemo } from "react";
import { useRobotsStore } from "@/store/robotsStore";

export const useRobotsByWarehouse = () => {
    const robots = useRobotsStore((s) => s.robots);

    if (robots) {
        return useMemo(() => ({
            p3:   robots.filter((r) => r.warehouse.toUpperCase() === "P3"),
            glpc: robots.filter((r) => r.warehouse.toUpperCase() === "GLPC"),
            all:  robots,
        }), [robots]);
    }

    return { p3: [], glpc: [], all: [] };
};