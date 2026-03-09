// store/useRobotsStore.ts
import {create} from 'zustand';
import {IRobot, IHistoryParts, IHistoryStatus} from '@/types/robot/robot';
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
    robots: IRobot[] | null;
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

    // Операции для истории статусов
    updateRobotStatus: (robotId: number, newStatus: string, statusHistoryEntry: IHistoryStatus) => void;
    addStatusHistory: (robotId: number, statusEntry: IHistoryStatus) => void;
    updateStatusHistory: (robotId: number, statusId: number, updatedFields: Partial<IHistoryStatus>) => void;
    deleteStatusHistory: (robotId: number, statusId: number) => void;

    // Статус загрузки
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    // Вспомогательные методы
    getRobotById: (robotId: number) => IRobot | undefined;
    getRobotStatusHistory: (robotId: number) => IHistoryStatus[];
    getLatestStatus: (robotId: number) => IHistoryStatus | undefined;
    clearStore: () => void;
}

export const useRobotsStore = create<RobotsState>((set, get) => ({
    robots: null,
    isLoading: false,
    error: null,

    addRobot: (robot) =>
        set((state) => ({
            robots: [...state.robots ?? [], robot]
        })),

    setRobots: (robots) => set({robots}),

    updateRobot: (robotId, updatedFields) =>
        set((state) => ({
            robots: (state.robots ?? []).map((robot) =>
                robot.id === robotId
                    ? {...robot, ...updatedFields}
                    : robot
            ),
        })),

    deleteRobot: (robotId) =>
        set((state) => ({
            robots: (state.robots ?? []).filter((robot) => robot.id !== robotId)
        })),

    addPartsHistory: (robotId, partsEntry) =>
        set((state) => ({
            robots: (state.robots ?? []).map((robot) =>
                robot.id === robotId
                    ? {
                        ...robot,
                        parts_history: [...(robot.parts_history ?? []), partsEntry]
                    }
                    : robot
            ),
        })),

    updatePartsHistory: (robotId, partsId, updatedFields) =>
        set((state) => ({
            robots: (state.robots ?? []).map((robot) =>
                robot.id === robotId
                    ? {
                        ...robot,
                        parts_history: (robot.parts_history ?? []).map((parts) =>
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
            robots: (state.robots ?? []).map((robot) =>
                robot.id === robotId
                    ? {
                        ...robot,
                        parts_history: (robot.parts_history ?? []).filter(
                            (parts) => parts.id !== partsId
                        )
                    }
                    : robot
            ),
        })),

    updateRobotStatus: (robotId, newStatus, statusHistoryEntry) =>
        set((state) => ({
            robots: (state.robots ?? []).map((robot) =>
                robot.id === robotId
                    ? {
                        ...robot,
                        status: newStatus,
                        updated_at: statusHistoryEntry.created_at,
                        status_history: [...(robot.status_history ?? []), statusHistoryEntry]
                    }
                    : robot
            ),
        })),

    addStatusHistory: (robotId, statusEntry) =>
        set((state) => ({
            robots: (state.robots ?? []).map((robot) =>
                robot.id === robotId
                    ? {
                        ...robot,
                        status_history: [...(robot.status_history ?? []), statusEntry]
                    }
                    : robot
            ),
        })),

    updateStatusHistory: (robotId, statusId, updatedFields) =>
        set((state) => ({
            robots: (state.robots ?? []).map((robot) =>
                robot.id === robotId
                    ? {
                        ...robot,
                        status_history: (robot.status_history ?? []).map((status) =>
                            status.id === statusId
                                ? {...status, ...updatedFields}
                                : status
                        )
                    }
                    : robot
            ),
        })),

    deleteStatusHistory: (robotId, statusId) =>
        set((state) => ({
            robots: (state.robots ?? []).map((robot) =>
                robot.id === robotId
                    ? {
                        ...robot,
                        status_history: (robot.status_history ?? []).filter(
                            (status) => status.id !== statusId
                        )
                    }
                    : robot
            ),
        })),

    setLoading: (isLoading) => set({isLoading}),
    setError: (error) => set({error}),

    getRobotById: (robotId) => get().robots?.find((robot) => robot.id === robotId),

    getRobotStatusHistory: (robotId) => {
        const robot = get().getRobotById(robotId);
        return robot?.status_history || [];
    },

    getLatestStatus: (robotId) => {
        const robot = get().getRobotById(robotId);
        if (!robot || !robot.status_history?.length) {
            return undefined;
        }

        // Возвращает последнюю запись из истории
        return robot.status_history[robot.status_history.length - 1];
    },

    clearStore: () => set({robots: [], isLoading: false, error: null}),
}));