import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Construction, Loader, Pencil, SmilePlus, LucideIcon } from "lucide-react";
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
import { toast } from "sonner";
import { changeRobotStatus } from "@/futures/robots/changeRobotStatus";
import { robotUpdate } from "@/futures/robots/robotUpdate";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { useUserStore } from "@/store/user";
import { useRobotsStore } from "@/store/robotsStore";
import { IRobot } from "@/types/robot/robot";
import dayjs from "dayjs";

// Константы статусов
const STATUS = {
    ONLINE: '在线 | Online',
    OFFLINE: '离线 | Offline'
} as const;

// Типы проблем для разных действий
const ISSUE_TYPES = {
    MAINTENANCE: [
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
    ],
    SOLUTION: [
        '软件升级 / Software Upgrade',
        '更换备件 / Replaced Spare Parts',
        '无需更改即可解决 / Solved without changing',
        '软件修复 / Software fix',
        '其他 / Other'
    ]
} as const;

// Типы действий
type ActionType = 'edit' | 'sendToMaintenance' | 'sendToMap';

// Конфигурация для каждого типа действия
interface ActionConfig {
    icon: LucideIcon;
    title: string;
    description: string;
    buttonText: string;
    buttonVariant: 'ghost' | 'outline' | 'default';
    buttonFullWidth: boolean;
    successMessage: string;
    newStatus: typeof STATUS.ONLINE | typeof STATUS.OFFLINE;
    oldStatus: typeof STATUS.ONLINE | typeof STATUS.OFFLINE;
    issueTypes: readonly string[];
    selectLabel: string;
    selectPlaceholder: string;
    textareaPlaceholder: string;
    clearIssueOnSubmit: boolean;
}

const ACTION_CONFIGS: Record<ActionType, ActionConfig> = {
    edit: {
        icon: Pencil,
        title: 'Edit status',
        description: 'Here you can edit the status of the robot.',
        buttonText: 'Save changes',
        buttonVariant: 'ghost',
        buttonFullWidth: false,
        successMessage: 'Robot successfully sent to maintenance',
        newStatus: STATUS.OFFLINE,
        oldStatus: STATUS.ONLINE,
        issueTypes: ISSUE_TYPES.MAINTENANCE,
        selectLabel: 'Issue Type',
        selectPlaceholder: 'Select an issue type',
        textareaPlaceholder: 'Describe the issue or any additional details...',
        clearIssueOnSubmit: false
    },
    sendToMaintenance: {
        icon: Construction,
        title: 'Send to Maintenance',
        description: 'Please select the issue type and provide any additional notes about the problem.',
        buttonText: 'Send to Maintenance',
        buttonVariant: 'outline',
        buttonFullWidth: true,
        successMessage: 'Robot successfully sent to maintenance',
        newStatus: STATUS.OFFLINE,
        oldStatus: STATUS.ONLINE,
        issueTypes: ISSUE_TYPES.MAINTENANCE,
        selectLabel: 'Issue Type',
        selectPlaceholder: 'Select an issue type',
        textareaPlaceholder: 'Describe the issue or any additional details...',
        clearIssueOnSubmit: false
    },
    sendToMap: {
        icon: SmilePlus,
        title: 'Send to Map',
        description: 'Please select the issue type and provide any additional notes about the problem.',
        buttonText: 'Send to Map',
        buttonVariant: 'default',
        buttonFullWidth: true,
        successMessage: 'Robot successfully sent to map',
        newStatus: STATUS.ONLINE,
        oldStatus: STATUS.OFFLINE,
        issueTypes: ISSUE_TYPES.SOLUTION,
        selectLabel: '处理方案 / Solutions',
        selectPlaceholder: 'Select a solution type',
        textareaPlaceholder: 'Describe the solution steps or any additional details...',
        clearIssueOnSubmit: true
    }
};

interface RobotStatusDialogProps {
    currentRobot: IRobot;
    actionType: ActionType;
}

const RobotStatusDialog: React.FC<RobotStatusDialogProps> = ({currentRobot, actionType}) => {
    const config = ACTION_CONFIGS[actionType];
    const Icon = config.icon;

    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [issueType, setIssueType] = useState(
        actionType === 'edit' ? (currentRobot.type_problem || '') : ''
    );
    const [issueNote, setIssueNote] = useState(
        actionType === 'edit' ? (currentRobot.problem_note || '') : ''
    );

    const currentUser = useUserStore(state => state.current_user);

    const setNewStatus = useRobotsStore(state => state.updateRobotStatus);
    const updateRobot = useRobotsStore(state => state.updateRobot);

    const resetForm = () => {
        setIssueType(actionType === 'edit' ? (currentRobot.type_problem || '') : '');
        setIssueNote(actionType === 'edit' ? (currentRobot.problem_note || '') : '');
        setIsOpen(false);
    };

    const validateForm = (): boolean => {
        if (!issueType) {
            toast.error("Please select an issue type");
            return false;
        }
        if (!currentUser) {
            toast.error("User not found");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsLoading(true);

            // Определяем данные для обновления робота
            const robotUpdateData = config.clearIssueOnSubmit
                ? { type_problem: '', problem_note: '' }
                : { type_problem: issueType, problem_note: issueNote };

            // Параллельное выполнение запросов
            const [statusResponse] = await Promise.all([
                changeRobotStatus({
                    robot_id: currentRobot.id,
                    robot_number: Number(currentRobot.robot_number),
                    card_id: currentUser?.card_id || 0,
                    new_status: config.newStatus,
                    old_status: config.oldStatus,
                    type_problem: issueType,
                    problem_note: issueNote
                }),
                robotUpdate({
                    robot_id: currentRobot.id,
                    card_id: currentUser?.card_id || 0,
                    ...robotUpdateData
                })
            ]);

            if (!statusResponse) {
                throw new Error(`Failed to ${actionType}`);
            }

            if (!currentUser) {
                throw new Error("User not found");
            }

            // Обновление локального состояния
            setNewStatus(currentRobot.id, config.newStatus, {
                id: dayjs().valueOf(),
                add_by: currentUser?.card_id || 0,
                robot_id: currentRobot.id || 0,
                created_at: Date.now() as Timestamp,
                new_status: config.newStatus,
                old_status: config.oldStatus,
                robot_number: Number(currentRobot.robot_number) || 0,
                user: currentUser,
                type_problem: issueType,
                problem_note: issueNote
            });

            updateRobot(currentRobot.id, {...robotUpdateData, updated_by: currentUser});

            toast.success(config.successMessage);
            resetForm();

        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : `Failed to ${actionType}`;
            toast.error(errorMessage);
        } finally {
            setTimeout(() => setIsLoading(false), 1000);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={config.buttonVariant}
                    disabled={isLoading}
                    className={config.buttonFullWidth ? 'w-full' : ''}
                    aria-label={config.title}
                >
                    {isLoading ? (
                        <Loader className="animate-spin" />
                    ) : (
                        <Icon />
                    )}
                    {config.buttonFullWidth && config.buttonText}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {config.title} #{currentRobot.robot_number}
                        </DialogTitle>
                        <DialogDescription>
                            {config.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3">
                            <Label htmlFor="issue-type">
                                {config.selectLabel} <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={issueType}
                                onValueChange={setIssueType}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full" id="issue-type">
                                    <SelectValue placeholder={config.selectPlaceholder} />
                                </SelectTrigger>
                                <SelectContent className="max-w-[calc(100vw-2rem)]">
                                    <SelectGroup>
                                        <SelectLabel>Issue Types</SelectLabel>
                                        {config.issueTypes.map((item, index) => (
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
                                value={issueNote}
                                onChange={(e) => setIssueNote(e.target.value)}
                                placeholder={config.textareaPlaceholder}
                                rows={4}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={isLoading || !issueType}
                        >
                            {isLoading ? 'Sending...' : config.buttonText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RobotStatusDialog;