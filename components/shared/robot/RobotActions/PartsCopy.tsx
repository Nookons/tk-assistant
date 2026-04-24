import { Button } from "@/components/ui/button";
import {
    Dialog, DialogClose, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { ClipboardList, Copy, Package } from "lucide-react";
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { getInitialShift, getInitialShiftByTime } from "@/futures/date/getInitialShift";
import { getWorkDate } from "@/futures/date/getWorkDate";
import { toast } from "sonner";
import { IRobot } from "@/types/robot/robot";
import { useStockStore } from "@/store/stock";

type Part = NonNullable<IRobot['parts_history']>[number];

const PartsCopy = ({ robot }: { robot: IRobot }) => {
    const currentShift = getInitialShift();
    const parts_template = useStockStore(state => state.items_templates);

    const partsSorted = React.useMemo(() =>
        [...(robot.parts_history ?? [])].sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
        ), [robot.parts_history]);

    const currentShiftParts = React.useMemo(() =>
        partsSorted.filter((part) => {
            const date = new Date(part.created_at);
            const shift = getInitialShiftByTime(date);
            const workDate = dayjs(getWorkDate(date)).format('YYYY-MM-DD');
            const nowWorkDate = dayjs(getWorkDate(new Date())).format('YYYY-MM-DD');
            return shift === currentShift && workDate === nowWorkDate;
        }), [partsSorted, currentShift]);

    const getDescription = (partNum: string): string => {
        const template = parts_template?.find(t => t.material_number === partNum);
        return template?.description_eng ?? '';
    };

    const formatPartLines = (part: Part): string => {
        const partNumbers: string[] = JSON.parse(part.parts_numbers);
        let text = '';

        partNumbers.forEach((num) => {
            const desc = getDescription(num);
            text += `• ${num}${desc ? ` — ${desc}` : ''}\n`;
        });

        text += `• ${part.quantity ?? 1} pcs\n`;
        return text;
    };

    const buildPartText = (part: Part): string => {
        const date = dayjs(part.created_at).format('MM/DD/YYYY HH:mm');
        return `${part.user.user_name} — ${date}\n\n${robot.robot_number} ${robot.robot_type ? ` — ${robot.robot_type}` : ''}\n\n${formatPartLines(part)}`
    };

    const buildShiftText = (parts: Part[]): string => {
        if (!parts.length) return '';
        let text = `${robot.robot_number} ${robot.robot_type ? ` — ${robot.robot_type}` : ''} (${currentShift.toUpperCase()})\n\n`;
        parts.forEach((part) => {
            text += `${formatPartLines(part)}\n`;
        });
        return text;
    };

    const copyToClipboard = (text: string, successMsg: string, emptyMsg?: string) => {
        if (!text) {
            toast.error(emptyMsg ?? "Nothing to copy");
            return;
        }
        navigator.clipboard.writeText(text);
        toast.success(successMsg);
    };

    const handleCopyShift = () =>
        copyToClipboard(buildShiftText(currentShiftParts), "Shift copied", "No parts for current shift");

    const handleCopyPart = (part: Part) =>
        copyToClipboard(buildPartText(part), "Part copied");

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex gap-2 items-center w-full cursor-pointer">
                    <ClipboardList />
                    <p>Copy to chat</p>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Copy parts</DialogTitle>
                    <DialogDescription>
                        List changed parts on robot for copy.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <ScrollArea className="h-[60dvh] w-full rounded-md border">
                        {partsSorted.map((part, index) => {
                            const partNumbers: string[] = JSON.parse(part.parts_numbers);

                            return (
                                <div key={index} className="overflow-hidden border">
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-[25px_1fr_1fr_25px] items-center gap-4">
                                            <Badge variant="secondary" className="md:text-lg font-bold shrink-0">
                                                {part.quantity ?? 1}
                                            </Badge>

                                            <div className="flex-1">
                                                <p className="text-sm">{part.user.user_name ?? ""}</p>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {partNumbers.map((partNum, i) => {
                                                        const desc = getDescription(partNum);

                                                        return (
                                                            <div key={i} className="flex flex-col items-start gap-0.5">
                                                                <Badge variant="outline" className="font-mono text-xs">
                                                                    {partNum}
                                                                </Badge>
                                                                {desc && (
                                                                    <span className="text-xs mt-1 line-clamp-2 text-muted-foreground pl-1">
                                                                        {desc}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 h-7 w-7"
                                                onClick={() => handleCopyPart(part)}
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <span>{dayjs(part.created_at).format('dddd, MM/DD HH:mm')}</span>
                                        </div>
                                    </CardContent>
                                </div>
                            );
                        })}
                    </ScrollArea>
                </div>

                <DialogFooter className="sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button">Close</Button>
                    </DialogClose>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={handleCopyShift}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Copy current shift
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PartsCopy;