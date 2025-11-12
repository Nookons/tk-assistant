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
import {SquarePlus, ThumbsDown} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {ParamValue} from "next/dist/server/request/params";

const AddRobot = ({card_id} : {card_id: ParamValue}) => {

    const [robot_number, setRobot_number] = useState<string>("")
    const [robot_type, setRobot_type] = useState<string>("")
    const [who_complain, setWho_complain] = useState<string>("")
    const [why_complain, setWhy_complain] = useState<string>('')

    return (
        <Dialog>
            <DialogTrigger>
                <div className={`mb-4`}>
                    <Button variant={`outline`}><SquarePlus /> Add robot for repair</Button>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-[425px] w-full max-h-[90vh] overflow-y-auto rounded-2xl">
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
                            <Select value={who_complain} onValueChange={(value) => setWho_complain(value)}>
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
                                </SelectContent>
                            </Select>
                            <Textarea
                                className="w-full"
                                value={why_complain}
                                onChange={(e) => setWhy_complain(e.target.value)}
                                placeholder="Why are you adding this robot to repair?"
                            />
                            <Button>Add</Button>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default AddRobot;