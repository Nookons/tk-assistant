import React, { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { ClipboardList, Copy, FileStack } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { IHistoryParts, IRobot } from "@/types/robot/robot";
import dayjs from "dayjs";
import { getPartByNumber } from "@/futures/stock/getPartByNumber";
import { IStockItemTemplate } from "@/types/stock/StockItem";
import { timeToString } from "@/utils/timeToString";
import { toast } from "sonner";
import { getWorkDate } from "@/futures/Date/getWorkDate";

interface IPartLocal extends IStockItemTemplate {
    part_user_data: IHistoryParts;
}

interface IGroupedPart extends IPartLocal {
    count: number;
    timestamps: number[];
}

const PartCopy = ({ robot }: { robot: IRobot }) => {
    const [parts_data, setParts_data] = useState<IPartLocal[]>([]);

    useEffect(() => {
        if (!robot) return;

        const fetchParts = async () => {
            const parts_history = robot.parts_history;

            const dateValue = dayjs().toDate();
            const date = await getWorkDate(dateValue);

            const updatedParts = await Promise.all(
                parts_history
                    .filter(part =>
                        dayjs(part.created_at).format('YYYY-MM-DD') ===
                        dayjs(date).format('YYYY-MM-DD')
                    )
                    .map(async (part) => {
                        const partNumbers: string[] = JSON.parse(part.parts_numbers);

                        const stockParts = await Promise.all(
                            partNumbers.map(item => getPartByNumber(item))
                        );

                        const PartsToFlat = stockParts.flat();

                        return {
                            ...PartsToFlat[0],
                            part_user_data: part
                        };
                    })
            );

            setParts_data(updatedParts);
        };

        fetchParts();
    }, [robot]);

    // Группируем части по material_number
    const groupedParts = useMemo(() => {
        const grouped = new Map<string, IGroupedPart>();

        parts_data.forEach(part => {
            const key = part.material_number;
            const existing = grouped.get(key);

            if (existing) {
                existing.count += 1;
                existing.timestamps.push(part.part_user_data.created_at);
            } else {
                grouped.set(key, {
                    ...part,
                    count: 1,
                    timestamps: [part.part_user_data.created_at]
                });
            }
        });

        return Array.from(grouped.values());
    }, [parts_data]);

    const copySingle = async (part: IGroupedPart) => {
        const rows = [
            `🤖 Robot ${part.part_user_data.robot.robot_number}\n`,
            `• ${part.description_orginall}`,
            `• ${part.description_eng}`,
            `• ${part.material_number}${part.count > 1 ? ` (x${part.count})` : ''}`,
            `• ${part.timestamps.map(ts => dayjs(ts).format("HH:mm")).join(', ')}`,
        ];

        const tsvContent = rows.join('\n');

        await navigator.clipboard.writeText(tsvContent);
        toast.success("Copied to clipboard");
    };

    const copyDay = async () => {
        let robot_number = "";
        let robot_type = "";

        const rows = groupedParts.map(item => {
            robot_number = item.part_user_data.robot.robot_number;
            robot_type = item.part_user_data.robot.robot_type;

            return [
                `• ${item.description_orginall}`,
                `• ${item.description_eng}`,
                `• ${item.material_number}${item.count > 1 ? ` (x${item.count})` : ''}`,
                `• ${item.timestamps.map(ts => dayjs(ts).format("HH:mm")).join(', ')}`,
            ];
        });

        const tsvContent = [
            `🤖 ${robot_type} - ${robot_number} (DAY)`,
            ...rows.map(row => row.join('\n'))
        ].join('\n\n');

        navigator.clipboard.writeText(tsvContent).then(() => {
            toast.success("Copied to clipboard");
        });
    };

    if (!parts_data || parts_data.length === 0) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="group w-full relative flex items-center gap-2"
                >
                    <div className="relative w-5 h-5">
                        <ClipboardList
                            className="
                                absolute inset-0
                                transition-all duration-300
                                group-hover:opacity-0 group-hover:scale-75
                              "
                        />

                        <FileStack
                            className="
                                absolute inset-0 opacity-0 scale-75
                                transition-all duration-300
                                group-hover:opacity-100 group-hover:scale-100
                              "
                        />
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Parts for a copy</DialogTitle>
                    <DialogDescription>
                        {timeToString(dayjs().valueOf())}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        {groupedParts.map((item) => (
                            <div key={item.material_number} className="flex items-center gap-4">
                                <div>
                                    <Button onClick={() => copySingle(item)} variant="outline">
                                        <Copy size={16} />
                                    </Button>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm">
                                            {timeToString(item.timestamps[0])}
                                        </p>
                                        {item.count > 1 && (
                                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                                                x{item.count}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm">
                                        {item.description_orginall} - {item.description_eng}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.material_number}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => copyDay()} variant="outline">
                        Copy for a day
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PartCopy;