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
import {Bot, SquarePlus, ThumbsDown} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {ParamValue} from "next/dist/server/request/params";
import {toast} from "sonner";
import {useRobotsStore} from "@/store/robotsStore";
import {IRobot} from "@/types/robot/robot";

const AddRobot = ({card_id} : {card_id: ParamValue}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [robot_number, setRobot_number] = useState<string>("")
    const [robot_type, setRobot_type] = useState<string>("")
    const [type_problem, setType_problem] = useState<string>("")
    const [problem_note, setProblem_note] = useState<string>('')

    const addRobotToStore = useRobotsStore(state => state.addRobot)

    const addRobotHandle = async () => {
        try {
            setIsLoading(true)

            if (!robot_number) {
                toast.error('Please input robot number')
                return
            }

            if (!robot_type) {
                toast.error('Please input robot type')
                return
            }

            if (!type_problem) {
                toast.error('Please input problem type')
                return
            }


            const res = await fetch(`/api/robots/add-robot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ card_id, robot_number, robot_type, type_problem, problem_note }),
            });


            const res_user = await fetch(`/api/user/update-user-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ card_id, value: 0.15}),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.message || 'Failed to add robot');
            }

            if (!res_user.ok) {
                const data = await res.json();
                throw new Error(data?.message || 'Failed to add robot');
            }

            const response = await res.json()
            addRobotToStore(response as IRobot)
            toast.success('Robot added successfully')
        }
        catch (error: any) {
            console.log(error);
        } finally {
            setTimeout(() => {
                setRobot_number('')
                setRobot_type('')
                setType_problem('')
                setProblem_note('')
                setIsLoading(false)
                setIsOpen(false)
            }, 250)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
            <DialogTrigger>
                <div className={`mb-4`}>
                    <Button variant={`outline`}><SquarePlus /> Add robot for repair</Button>
                </div>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto rounded-xl flex flex-col items-center">
            <DialogHeader>
                    <DialogTitle>Add robot to maintenance?</DialogTitle>
                    <DialogDescription>
                        This action will add a robot to maintenance area and guys who fix them will be know about this.
                        <div className="mt-4 flex flex-col gap-2">
                            <Input
                                type={`number`}
                                placeholder={`Please input robot number`}
                                value={robot_number}
                                onChange={(e) => setRobot_number(e.target.value)}
                            />
                            <Select value={robot_type} onValueChange={(value) => setRobot_type(value)}>
                                <SelectTrigger className={`w-full`}>
                                    <SelectValue placeholder="Robot Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={`RT_KUBOT`} key={`RT_KUBOT`}>
                                        RT KUBOT
                                    </SelectItem>
                                    <SelectItem value={`RT_KUBOT_MINI_HAIFLEX`} key={`RT_KUBOT_MINI_HAIFLEX`}>
                                        RT_KUBOT_MINI_HAIFLEX
                                    </SelectItem>
                                    <SelectItem value={`RT_KUBOT_E2`} key={`RT_KUBOT_E2`}>
                                        RT_KUBOT_E2
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={type_problem} onValueChange={(value) => setType_problem(value)}>
                                <SelectTrigger className={`w-full`}>
                                    <SelectValue placeholder="Which problem?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={`Lifting`} key={`Lifting`}>
                                        Lifting Control
                                    </SelectItem>
                                    <SelectItem value={`Rotation`} key={`Rotation`}>
                                        Rotation Control
                                    </SelectItem>
                                    <SelectItem value={`Telescoping`} key={`Telescoping`}>
                                        Telescoping Control
                                    </SelectItem>
                                    <SelectItem value={`Finger`} key={`Finger`}>
                                        Finger Control
                                    </SelectItem>
                                    <SelectItem value={`Chassis`} key={`Chassis`}>
                                        Chassis Control
                                    </SelectItem>
                                    <SelectItem value={`Camera`} key={`Camera`}>
                                        Camera Control
                                    </SelectItem>
                                    <SelectItem value={`Voice`} key={`Voice`}>
                                        Voice Control
                                    </SelectItem>
                                    <SelectItem value={`Bracing`} key={`Bracing`}>
                                        Bracing Control
                                    </SelectItem>
                                    <SelectItem value={`System Bag`} key={`system_bag`}>
                                        System Bag
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Textarea
                                className="w-full"
                                value={problem_note}
                                onChange={(e) => setProblem_note(e.target.value)}
                                placeholder="Why are you adding this robot to repair?"
                            />
                            <Button disabled={isLoading} onClick={() => addRobotHandle()}><Bot className={`${isLoading && 'animate-ping'}`} /> Add</Button>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default AddRobot;