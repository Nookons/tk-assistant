// store/useRobotsStore.ts
import {create} from 'zustand';
import {IRobot} from '@/types/robot/robot';

interface RobotsState {
    robots: IRobot[];
    isLoading: boolean;
    error: string | null;
    addRobot: (robot: IRobot) => void;
    setRobots: (robots: IRobot[]) => void;
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

    setLoading: (isLoading) => set({isLoading}),

    setError: (error) => set({error})
}));

// Использование в компоненте (альтернативный вариант)
// import {useRobotsStore} from '@/store/useRobotsStore';
// 
// const RobotsList = ({data, card_id}) => {
//     const {robots, updateRobotStatus: updateStoreStatus, setRobots} = useRobotsStore();
//     
//     useEffect(() => {
//         setRobots(data);
//     }, [data, setRobots]);
//     
//     // ... rest of component
// }