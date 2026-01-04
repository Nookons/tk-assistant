import React, {useState} from 'react';
import {Loader, SmilePlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {changeRobotStatus} from "@/futures/robots/changeRobotStatus";
import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {toast} from "sonner";
import {IRobot} from "@/types/robot/robot";
import {useRobotsStore} from "@/store/robotsStore";
import {useUserStore} from "@/store/user";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {robotUpdate} from "@/futures/robots/robotUpdate";

const SendRobotToMap = ({current_Robot}: {current_Robot: IRobot}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const user_store = useUserStore(state => state.current_user)
    const setNewStatus = useRobotsStore(state => state.updateRobotStatus)
    const updateRobot = useRobotsStore(state => state.updateRobot)

    const sendToMap = async () => {
        try {
            if (!current_Robot) return;
            if (!user_store) return;

            setIsLoading(true);

            const res = await changeRobotStatus({
                robot_id: current_Robot.id,
                robot_number: Number(current_Robot.robot_number),
                card_id: user_store?.card_id || 0,
                new_status: `在线 | Online`,
                old_status: `离线 | Offline`,
                type_problem: null,
                problem_note: null
            });

            const res_robot_update = await robotUpdate({
                robot_id: current_Robot.id,
                card_id: user_store?.card_id || 0,
                type_problem: '',
                problem_note: ''
            });

            if (!res) throw new Error("Failed to send robot to map");

            setNewStatus(current_Robot.id, "在线 | Online" ,{
                id: 9999,
                add_by: user_store?.card_id || 0,
                robot_id: current_Robot.id || 0,
                created_at: Date.now() as Timestamp,
                new_status: `在线 | Online`,
                old_status: `离线 | Offline`,
                robot_number: Number(current_Robot.robot_number) || 0,
                user: user_store,
                type_problem: null,
                problem_note: null
            })

            updateRobot(current_Robot.id, {
                type_problem: '',
                problem_note: ''
            })

            toast.success("Robot successfully sent to map");

        } catch (error) {
            error && toast.error(error.toString() || "Failed to send robot to map");
        } finally {
            setTimeout(() => setIsLoading(false), 1000);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    disabled={isLoading}
                    className={`w-full`}
                >
                    {isLoading ? <Loader className={`animate-spin`} /> : <SmilePlus/>}
                    Send to Map
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Send Robot #{current_Robot.robot_number} to Map?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will change the robot's status from "Offline" to "Online" and clear any existing problem reports. The robot will be marked as operational and available on the map.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={sendToMap}>
                        {isLoading ? "Sending..." : "Send to Map"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default SendRobotToMap;