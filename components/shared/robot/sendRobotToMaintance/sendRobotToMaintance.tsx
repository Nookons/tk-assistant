import React, {useState} from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Construction, Loader} from "lucide-react";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {changeRobotStatus} from "@/futures/robots/changeRobotStatus";
import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {toast} from "sonner";
import {IRobot} from "@/types/robot/robot";
import {useUserStore} from "@/store/user";
import {useRobotsStore} from "@/store/robotsStore";
import {robotUpdate} from "@/futures/robots/robotUpdate";

const IssueList = [
    '安全控制器问题/Safety controller issues',
    '行走异常/Abnormal walking',
    '台面倾斜，举升高度问题/Table tilt lifting height problem',
    '尾翼变形/Tail deformation',
    '电池问题/Battery Issues',
    '充电问题/Charging Issues',
    '万向轮卡顿/Universal wheel stuck',
    '雷达问题/Radar Problems',
    '小车车身部件撞坏/Damaged car body parts',
    '参数问题/Parameter Problem',
    '环境问题/Environmental issues',
    '升降电机问题/Lift motor problem',
    '驱动器电机/Drive motor',
    '网络问题/Network Issues',
    '相机问题/Camera Issues',
    '小车缓存位取箱光电问题/Photoelectric problem of picking up boxes from the car cache',
    '电源板/Power Board',
    '主控板/Main control board',
    '行走异响/Walking noise',
    '电池通讯线松动/Battery communication line is loose',
    '其他/other'
]

const SendRobotToMaintance = ({current_Robot}: {current_Robot: IRobot}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const user_store = useUserStore(state => state.current_user)
    const setNewStatus = useRobotsStore(state => state.updateRobotStatus)
    const updateRobot = useRobotsStore(state => state.updateRobot)

    const [issue_type, setIssue_type] = useState<string>('')
    const [issue_note, setIssue_note] = useState<string>("")

    const sendToMaintenance = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!issue_type) {
            toast.error("Please select an issue type");
            return;
        }

        try {
            if (!current_Robot) return;
            if (!user_store) return;

            setIsLoading(true);

            const res = await changeRobotStatus({
                robot_id: current_Robot.id,
                robot_number: Number(current_Robot.robot_number),
                card_id: user_store?.card_id || 0,
                new_status: `离线 | Offline`,
                old_status: `在线 | Online`
            });

            const res_robot_update = await robotUpdate({
                robot_id: current_Robot.id,
                card_id: user_store?.card_id || 0,
                type_problem: issue_type,
                problem_note: issue_note
            });

            if (!res) throw new Error("Failed to send robot to maintenance");

            setNewStatus(current_Robot.id, "离线 | Offline" ,{
                id: 9999,
                add_by: user_store?.card_id || 0,
                robot_id: current_Robot.id || 0,
                created_at: Date.now() as Timestamp,
                new_status: `离线 | Offline`,
                old_status: `在线 | Online`,
                robot_number: Number(current_Robot.robot_number) || 0,
                user: user_store,
            })

            updateRobot(current_Robot.id, {
                type_problem: issue_type,
                problem_note: issue_note
            })

            toast.success("Robot successfully sent to maintenance");
            setIsOpen(false);
            setIssue_type('');
            setIssue_note('');

        } catch (error) {
            error && toast.error(error.toString() || "Failed to send robot to maintenance");
        } finally {
            setTimeout(() => setIsLoading(false), 1000);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={`outline`}
                    disabled={isLoading}
                    className={`w-full`}
                >
                    {isLoading ? <Loader className={`animate-spin`} /> : <Construction/>}
                    Send to Maintenance
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={sendToMaintenance}>
                    <DialogHeader>
                        <DialogTitle>Send Robot #{current_Robot.robot_number} to Maintenance</DialogTitle>
                        <DialogDescription>
                            Please select the issue type and provide any additional notes about the problem.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3">
                            <Label htmlFor="issue-type">Issue Type *</Label>
                            <Select value={issue_type} onValueChange={(value) => setIssue_type(value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select an issue type" />
                                </SelectTrigger>
                                <SelectContent className="max-w-[calc(100vw-2rem)]">
                                    <SelectGroup>
                                        <SelectLabel>Issue Types</SelectLabel>
                                        {IssueList.map((item, index) => (
                                            <SelectItem
                                                key={index}
                                                className="max-w-full"
                                                value={item}
                                            >
                                                <span className="block truncate max-w-[300px]">
                                                    {item}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="issue-notes">Additional Notes</Label>
                            <Textarea
                                id="issue-notes"
                                value={issue_note}
                                onChange={(e) => setIssue_note(e.target.value)}
                                placeholder="Describe the issue or any additional details..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading || !issue_type}>
                            {isLoading ? "Sending..." : "Send to Maintenance"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SendRobotToMaintance;