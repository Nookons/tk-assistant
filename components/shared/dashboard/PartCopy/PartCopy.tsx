import React, {useEffect, useState} from 'react';
import {Button} from "@/components/ui/button";
import {ClipboardList, Copy, FileStack} from "lucide-react";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {IHistoryParts, IRobot} from "@/types/robot/robot";
import dayjs from "dayjs";
import {getPartByNumber} from "@/futures/stock/getPartByNumber";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {timeToString} from "@/utils/timeToString";
import {toast} from "sonner";

interface IPartLocal extends IStockItemTemplate {

    part_user_data: IHistoryParts
}

const PartCopy = ({robot}: { robot: IRobot }) => {
    const [parts_data, setParts_data] = useState<IPartLocal[]>([])

    useEffect(() => {
        if (!robot) return;

        const fetchParts = async () => {
            const parts_history = robot.parts_history;

            const updatedParts = await Promise.all(
                parts_history.map(async (part) => {
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

    const copySingle = async (part: IPartLocal) => {
        const rows = [
            `🤖 Robot ${part.part_user_data.robot.robot_number}\n`,
            `•︎︎ ${part.description_orginall}`,
            `•︎︎ ${part.description_eng}`,
            `•︎ ${part.material_number}`,
            `•︎ ${timeToString(part.part_user_data.created_at)} - ${part.part_user_data.user.user_name}`,
        ];

        const tsvContent = rows.join('\n');

        await navigator.clipboard.writeText(tsvContent);
        toast.success("Copied to clipboard");
    };


    const copyDay = async () => {
        let robot_number = ""

        const rows = parts_data.map(item => {
            robot_number = item.part_user_data.robot.robot_number;

            return [
                `•︎︎ ${item.description_orginall}`,
                `•︎︎ ${item.description_eng}`,
                `•︎ ${item.material_number}`,
                `•︎ ${timeToString(item.part_user_data.created_at)} - ${item.part_user_data.user.user_name}`,
            ];
        });

        const tsvContent = [`🤖 Robot ${robot_number} was changed following parts`,...rows.map(row => row.join('\n'))].join('\n\n');

        navigator.clipboard.writeText(tsvContent).then(() => {
            toast.success("Copied to clipboard");
        });
    }


    if (!parts_data) return null;

    return (
        <Dialog>
            <form>
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

                        <span>Copy Parts</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Parts for a copy</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            {parts_data.map((item, index) => {

                                return (
                                    (
                                        <div key={item.part_user_data.id} className="flex items-center gap-4">
                                            <div>
                                                <Button onClick={() => copySingle(item)} variant={`outline`}>
                                                    <Copy size={16}/>
                                                </Button>
                                            </div>
                                            <div>
                                                <p>{timeToString(item.part_user_data.created_at)}</p>
                                                <p>{item.description_orginall} - {item.description_eng}</p>
                                            </div>
                                        </div>
                                    )
                                )
                            })}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => copyDay()} variant="outline">Copy for a day</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default PartCopy;