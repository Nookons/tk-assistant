import React, {useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Bot, Check, ChevronDown, SquarePlus, ThumbsDown} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {ParamValue} from "next/dist/server/request/params";
import {toast} from "sonner";
import {useRobotsStore} from "@/store/robotsStore";
import {IRobot} from "@/types/robot/robot";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import {addRobotToMaintenance} from "@/futures/robots/addRobotToMaintenance";

const AddRobot = ({card_id}: { card_id: ParamValue }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [robot_number, setRobot_number] = useState<string>("")
    const [robot_type, setRobot_type] = useState<string>("")
    const [problem_note, setProblem_note] = useState<string>('')

    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<string[]>([])

    const [value, setValue] = useState<string>("")

    const options = [
        "安全控制器问题/Safety controller issues",
        "行走异常/Abnormal walking",
        "台面倾斜，举升高度问题/Table tilt lifting height problem",
        "尾翼变形/Tail deformation",
        "电池问题/Battery Issues",
        "充电问题/Charging Issues",
        "万向轮卡顿/Universal wheel stuck",
        "雷达问题/Radar Problems",
        "小车车身部件撞坏/Damaged car body parts",
        "参数问题/Parameter Problem",
        "环境问题/Environmental issues",
        "升降电机问题/Lift motor problem",
        "驱动器电机/Drive motor",
        "网络问题/Network Issues",
        "相机问题/Camera Issues",
        "小车缓存位取箱光电问题/Photoelectric problem of picking up boxes from the car cache",
        "电源板/Power Board",
        "主控板/Main control board",
        "行走异响/Walking noise",
        "电池通讯线松动/Battery communication line is loose",
        "其他/other",
    ]

    const toggleValue = (value: string) => {
        setSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        )
    }

    const addRobotToStore = useRobotsStore(state => state.addRobot)

    const addRobotHandle = async () => {
        try {
            setIsLoading(true)

            const robot_res = await addRobotToMaintenance({
                card_id,
                robot_number,
                robot_type,
                type_problem: selected,
                problem_note,
            });

            if (robot_res) {
                addRobotToStore(robot_res)
            }

        } catch (error: any) {
            console.log(error);
        } finally {
            setTimeout(() => {
                setRobot_number('')
                setRobot_type('')
                setProblem_note('')
                setIsLoading(false)
                setIsOpen(false)
            }, 250)
        }
    }


    return (
        <div className={`w-full`}>
            <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
                <DialogTrigger>
                    <div className={`mb-4`}>
                        <Button variant={`outline`}><SquarePlus/> Add robot for repair</Button>
                    </div>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md max-h-[85vh] flex flex-col rounded-xl">
                    <DialogHeader>
                        <DialogTitle>Add robot to maintenance?</DialogTitle>
                    </DialogHeader>

                    <div className="overflow-y-auto flex-1 px-1">
                        <DialogDescription className="sr-only">
                            This action will add a robot to maintenance area and guys who fix them will be know about this.
                        </DialogDescription>

                        <div className="flex flex-col gap-2 py-2">
                            <Input
                                type={`number`}
                                placeholder={`Please input robot number`}
                                value={robot_number}
                                onChange={(e) => setRobot_number(e.target.value)}
                            />
                            <Select value={robot_type} onValueChange={(value) => setRobot_type(value)}>
                                <SelectTrigger className={`w-full`}>
                                    <SelectValue placeholder="Robot Type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={`A42T`} key={`A42T`}>
                                        A42T
                                    </SelectItem>
                                    <SelectItem value={`K50H`} key={`K50H`}>
                                        K50H
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild className="w-full">
                                    <Button
                                        variant={'outline'}
                                        className="w-full justify-between" // добавьте justify-between
                                    >
            <span className="truncate text-left flex-1">
                {selected.length ? selected.join(", ") : "Problems"}
            </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50"/>
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent
                                    className="w-[var(--radix-popover-trigger-width)] p-0"
                                    align="start"
                                    sideOffset={5}
                                >
                                    <Command className="rounded-lg border shadow-md">
                                        <CommandInput
                                            placeholder="Type a problem or select..."
                                            className="h-9"
                                        />
                                        <CommandList className="max-h-[200px] overflow-y-auto">
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            <CommandGroup heading="Hai Box Modules">
                                                {options.map((item) => (
                                                    <CommandItem
                                                        key={item}
                                                        onSelect={() => toggleValue(item)}
                                                        className="flex items-center justify-between gap-2 cursor-pointer"
                                                    >
                                                        <span className="flex-1 truncate">{item}</span>
                                                        <Check
                                                            className={`h-4 w-4 shrink-0 transition-opacity ${
                                                                selected.includes(item)
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            }`}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <Textarea
                                className="w-full min-h-[80px]"
                                value={problem_note}
                                onChange={(e) => setProblem_note(e.target.value)}
                                placeholder="Why are you adding this robot to repair?"
                            />
                            <Button disabled={isLoading} onClick={() => addRobotHandle()}>
                                <Bot className={`${isLoading && 'animate-ping'}`}/> Add
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddRobot;