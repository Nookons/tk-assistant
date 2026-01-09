import React, { useState } from 'react';
import { Loader, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { changeRobotStatus } from "@/futures/robots/changeRobotStatus";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { toast } from "sonner";
import { IRobot } from "@/types/robot/robot";
import { useRobotsStore } from "@/store/robotsStore";
import { useUserStore } from "@/store/user";
import { robotUpdate } from "@/futures/robots/robotUpdate";
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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const IssueList = [
    '软件升级 / Software Upgrade',
    '更换备件 / Replaced Spare Parts',
    '无需更改即可解决 / Solved without changing',
    '软件修复 / Software fix',
    '其他 / Other',
];

const SendRobotToMap = ({ current_Robot }: { current_Robot: IRobot }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const user_store = useUserStore(state => state.current_user);
    const setNewStatus = useRobotsStore(state => state.updateRobotStatus);
    const updateRobot = useRobotsStore(state => state.updateRobot);

    const [issue_type, setIssue_type] = useState<string>('');
    const [issue_note, setIssue_note] = useState<string>("");

    const sendToMap = async (e: React.FormEvent) => {
        e.preventDefault(); // 🔴 предотвращает перезагрузку страницы

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
                type_problem: issue_type,
                problem_note: issue_note
            });

            await robotUpdate({
                robot_id: current_Robot.id,
                card_id: user_store?.card_id || 0,
                type_problem: '',
                problem_note: ''
            });

            if (!res) throw new Error("Failed to send robot to map");

            setNewStatus(current_Robot.id, "在线 | Online", {
                id: 9999,
                add_by: user_store?.card_id || 0,
                robot_id: current_Robot.id || 0,
                created_at: Date.now() as Timestamp,
                new_status: `在线 | Online`,
                old_status: `离线 | Offline`,
                robot_number: Number(current_Robot.robot_number) || 0,
                user: user_store,
                type_problem: issue_type,
                problem_note: issue_note
            });

            updateRobot(current_Robot.id, {
                type_problem: '',
                problem_note: ''
            });

            toast.success("Robot successfully sent to map");
        } catch (error: any) {
            toast.error(error?.toString() || "Failed to send robot to map");
        } finally {
            setTimeout(() => setIsLoading(false), 1000);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled={isLoading} className="w-full">
                    {isLoading ? <Loader className="animate-spin" /> : <SmilePlus />}
                    Send to Map
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={sendToMap}>
                    <DialogHeader>
                        <DialogTitle>
                            Send Robot #{current_Robot.robot_number} to Maintenance
                        </DialogTitle>
                        <DialogDescription>
                            Please select the issue type and provide any additional notes about the problem.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3">
                            <Label>处理方案 / Solutions *</Label>
                            <Select value={issue_type} onValueChange={setIssue_type}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a solution type" />
                                </SelectTrigger>
                                <SelectContent className="max-w-[calc(100vw-2rem)]">
                                    <SelectGroup>
                                        <SelectLabel>Issue Types</SelectLabel>
                                        {IssueList.map((item, index) => (
                                            <SelectItem key={index} value={item}>
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
                            <Label>Additional Notes</Label>
                            <Textarea
                                value={issue_note}
                                onChange={(e) => setIssue_note(e.target.value)}
                                placeholder="Describe the solution steps or any additional details..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading || !issue_type}>
                            {isLoading ? "Sending..." : "Send to Map"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SendRobotToMap;
