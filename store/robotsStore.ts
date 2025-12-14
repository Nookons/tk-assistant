// store/useRobotsStore.ts
import {create} from 'zustand';
import {IRobot} from '@/types/robot/robot';

// --- Обновленный интерфейс состояния ---
interface RobotsState {
    robots: IRobot[];
    isLoading: boolean;
    error: string | null;

    // CRUD операции
    addRobot: (robot: IRobot) => void;
    setRobots: (robots: IRobot[]) => void;
    updateRobot: (robotId: number, updatedFields: Partial<IRobot>) => void; // Добавлена функция обновления

    // Статус
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useRobotsStore = create<RobotsState>((set) => ({
    robots: [],
    isLoading: false,
    error: null,

    addRobot: (robot) =>
        set((state) => ({
            robots: [...state.robots, robot]
        })),

    setRobots: (robots) => set({robots}),

    // --- Функция для обновления робота по ID ---
    updateRobot: (robotId, updatedFields) =>
        set((state) => ({
            robots: state.robots.map((robot) =>
                robot.id === robotId
                    ? { ...robot, ...updatedFields } // Найдено совпадение: объединяем старые данные с новыми полями
                    : robot                           // Нет совпадения: оставляем робота без изменений
            ),
        })),
    // ------------------------------------------

    setLoading: (isLoading) => set({isLoading}),

    setError: (error) => set({error})
}));