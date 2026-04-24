import React from 'react';
import {Button} from "@/components/ui/button";
import {ClipboardList, Package, Pointer, SettingsIcon, UserIcon} from "lucide-react";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList, CommandSeparator
} from "@/components/ui/command";
import RobotStatusDialog from "@/components/shared/robot/EditStatus/RobotEditStatus";
import PartsPicker from "@/components/shared/RobotNew/RobotPartsPicker";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {ScrollArea} from "@/components/ui/scroll-area";
import {CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import dayjs from "dayjs";
import RepairPdf from "@/components/shared/robot/RepairPdf/RepairPdf";
import {IRobot} from "@/types/robot/robot";
import {isOffline} from "@/utils/Robot/isOffline";
import {toast} from "sonner";
import {getInitialShift, getInitialShiftByTime} from "@/futures/date/getInitialShift";
import {getWorkDate} from "@/futures/date/getWorkDate";
import PartsCopy from "@/components/shared/robot/RobotActions/PartsCopy";

const RobotActions = ({robot}: { robot: IRobot }) => {
    const [open, setOpen] = React.useState(false)

    const offline = isOffline(robot.status)


    return (
        <div className={`w-full md:w-fit`}>
            <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
                <Pointer/> Actions
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command>
                    <CommandInput className="text-base" placeholder="Type a command or search..."/>
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>

                        <CommandGroup heading="Suggestions">
                            <CommandItem>
                                <RobotStatusDialog
                                    currentRobot={robot}
                                    actionType={offline ? "sendToMap" : "sendToMaintenance"}
                                />
                            </CommandItem>

                            <CommandItem>
                                <PartsPicker robot={robot}/>
                            </CommandItem>

                            <CommandItem>
                                <PartsCopy robot={robot} />
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator/>

                        <CommandGroup heading="Settings">
                            <CommandItem>
                                <RepairPdf robot={robot}/>
                            </CommandItem>
                            <CommandItem>
                                <UserIcon/>
                                <span>Full History</span>
                            </CommandItem>
                            <CommandItem>
                                <SettingsIcon/>
                                <span>Settings</span>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>
        </div>
    );
};

export default RobotActions;