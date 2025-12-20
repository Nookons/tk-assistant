// store/useRobotsStore.ts
import {create} from 'zustand';
import {IRobot, IHistoryParts} from '@/types/robot/robot';
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import {IUser} from "@/types/user/user";

export interface IComment {
    id: number;
    robot_id: number;
    user_id: number;
    created_at: Timestamp;
    comment_text: string;
    user: IUser;
}

interface RobotsState {
    robots: IRobot[];
    isLoading: boolean;
    error: string | null;

    // CRUD операции для роботов
    addRobot: (robot: IRobot) => void;
    setRobots: (robots: IRobot[]) => void;
    updateRobot: (robotId: number, updatedFields: Partial<IRobot>) => void;
    deleteRobot: (robotId: number) => void;

    // Операции для истории запчастей
    addPartsHistory: (robotId: number, partsEntry: IHistoryParts) => void;
    updatePartsHistory: (robotId: number, partsId: number, updatedFields: Partial<IHistoryParts>) => void;
    deletePartsHistory: (robotId: number, partsId: number) => void;

    // Статус загрузки
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    // Вспомогательные методы
    getRobotById: (robotId: number) => IRobot | undefined;
    clearStore: () => void;
}

export const useRobotsStore = create<RobotsState>((set, get) => ({
    robots: [],
    isLoading: false,
    error: null,

    // === CRUD для роботов ===
    addRobot: (robot) =>
        set((state) => ({
            robots: [...state.robots, robot]
        })),

    setRobots: (robots) => set({robots}),

    updateRobot: (robotId, updatedFields) =>
        set((state) => ({
            robots: state.robots.map((robot) =>
                robot.id === robotId
                    ? {...robot, ...updatedFields}
                    : robot
            ),
        })),

    deleteRobot: (robotId) =>
        set((state) => ({
            robots: state.robots.filter((robot) => robot.id !== robotId)
        })),

    // === История запчастей ===
    addPartsHistory: (robotId, partsEntry) =>
        set((state) => ({
            robots: state.robots.map((robot) =>
                robot.id === robotId
                    ? {
                        ...robot,
                        parts_history: [...robot.parts_history, partsEntry]
                    }
                    : robot
            ),
        })),

    updatePartsHistory: (robotId, partsId, updatedFields) =>
        set((state) => ({
            robots: state.robots.map((robot) =>
                robot.id === robotId
                    ? {
                        ...robot,
                        parts_history: robot.parts_history.map((parts) =>
                            parts.id === partsId
                                ? {...parts, ...updatedFields}
                                : parts
                        )
                    }
                    : robot
            ),
        })),

    deletePartsHistory: (robotId, partsId) =>
        set((state) => ({
            robots: state.robots.map((robot) =>
                robot.id === robotId
                    ? {
                        ...robot,
                        parts_history: robot.parts_history.filter(
                            (parts) => parts.id !== partsId
                        )
                    }
                    : robot
            ),
        })),

    // === Статус загрузки ===
    setLoading: (isLoading) => set({isLoading}),

    setError: (error) => set({error}),

    // === Вспомогательные методы ===
    getRobotById: (robotId) => {
        return get().robots.find((robot) => robot.id === robotId);
    },

    clearStore: () => set({robots: [], isLoading: false, error: null}),
}));