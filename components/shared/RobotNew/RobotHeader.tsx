import React from 'react';
import {Badge} from "@/components/ui/badge";
import {
    Calendar,
    CalendarIcon,
    CheckCircle2Icon,
    ClipboardList,
    Clock,
    Construction,
    ListPlus,
    MapPin,
    Package,
    Pointer,
    SettingsIcon,
    UserIcon
} from "lucide-react";
import {timeToString} from "@/utils/timeToString";
import RobotStatusDialog from "@/components/shared/robot/EditStatus/RobotEditStatus";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {IRobot} from "@/types/robot/robot";
import {isOffline} from "@/utils/Robot/isOffline";
import {RobotImage} from "@/utils/Robot/getRobotImage";
import PartsPicker from "@/components/shared/RobotNew/RobotPartsPicker";
import {Button} from "@/components/ui/button";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
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
import dayjs from "dayjs";
import {CardContent} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ScrollArea} from "@/components/ui/scroll-area";
import {toast} from "sonner";
import {getInitialShift, getInitialShiftByTime} from "@/futures/date/getInitialShift";
import {getWorkDate} from "@/futures/date/getWorkDate";


const RobotHeader = ({robot}: { robot: IRobot }) => {

    if (!robot || !robot.parts_history) return null;

    const offline = isOffline(robot.status)
    const hasParts = robot.parts_history.length > 0

    const [open, setOpen] = React.useState(false)

    const partsSorted = [...robot.parts_history].sort(
        (a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf()
    );

    const currentShift = getInitialShift();

    const currentShiftParts = React.useMemo(() => {
        return partsSorted.filter((part) => {
            const date = new Date(part.created_at);

            const shift = getInitialShiftByTime(date);
            const workDate = dayjs(getWorkDate(date)).format('YYYY-MM-DD');
            const nowWorkDate = dayjs(getWorkDate(new Date())).format('YYYY-MM-DD');

            return shift === currentShift && workDate === nowWorkDate;
        });
    }, [partsSorted, currentShift]);

    const buildShiftText = (parts: typeof partsSorted) => {
        if (!parts.length) return '';
        let text = `🤖 ${robot.robot_number} (${currentShift.toUpperCase()})\n\n`;

        parts.forEach((part) => {
            const date = dayjs(part.created_at).format('MM/DD HH:mm');
            const partNumbers = JSON.parse(part.parts_numbers);

            partNumbers.forEach((num: string) => {
                text += `• ${num}\n`;
            });

            text += `• ${part.quantity ?? 1} pcs\n`;
            text += `• ${date}\n\n`;
        });

        return text;
    };

    const handleCopyShift = () => {
        const text = buildShiftText(currentShiftParts);

        if (!text) {
            toast.error("No parts for current shift");
            return;
        }

        navigator.clipboard.writeText(text);
        toast.success("Shift copied");
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 ${
                        offline
                            ? 'border-destructive/40 bg-destructive/5'
                            : 'border-emerald-500/40 bg-emerald-500/5'
                    }`}
                >
                    <RobotImage type={robot.robot_type} status={robot.status}/>
                </div>

                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {robot.robot_number}
                        </h1>
                        <Badge variant={offline ? 'destructive' : 'default'} className="text-xs">
                            {offline ? 'Offline' : 'Online'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <MapPin size={11}/> {robot.warehouse ?? '—'}
                        </span>
                        <span className="flex text-nowrap items-center gap-1">
                            <Clock size={11}/> {timeToString(robot.updated_at)}
                        </span>
                        {robot.updated_by && (
                            <span>{robot.updated_by.user_name}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className={`w-full md:w-fit`}>
                <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
                    <Pointer/> Actions
                </Button>

                <CommandDialog open={open} onOpenChange={setOpen}>
                    <Command>
                        <CommandInput placeholder="Type a command or search..."/>
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
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div className={`flex gap-2 items-center w-full cursor-pointer`}>
                                                <ClipboardList/>
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

                                            {/* 👉 НОВАЯ КНОПКА */}
                                            <div className="flex justify-end">
                                                <Button variant="outline" size="sm" onClick={handleCopyShift}>
                                                    <ClipboardList className="mr-2 h-4 w-4"/>
                                                    Copy current shift
                                                </Button>
                                            </div>

                                            <div className="space-y-3">
                                                <ScrollArea className="h-48.5 w-full rounded-md border">
                                                    {partsSorted.map((part, index) => (
                                                        <div key={index} className="overflow-hidden border">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <Badge variant="secondary" className="md:text-lg font-bold">
                                                                            {part.quantity ?? 1}
                                                                        </Badge>
                                                                    </div>

                                                                    <div className="flex-1 space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <Avatar className="h-8 w-8 hidden md:block">
                                                                                <AvatarImage
                                                                                    src={part.user.avatar_url ?? ""}
                                                                                    alt={part.user.user_name.substring(0, 2).toUpperCase()}
                                                                                    className="grayscale"
                                                                                />
                                                                                <AvatarFallback className="text-xs">
                                                                                    {part.user.user_name.substring(0, 2).toUpperCase()}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <div className="flex items-center gap-2 text-sm">
                                                                                <span className="font-medium">{part.user.user_name}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-start gap-2">
                                                                        <Package className="h-4 w-4 hidden md:block text-muted-foreground mt-1"/>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {JSON.parse(part.parts_numbers).map((partNum: string, i: number) => (
                                                                                <Badge key={i} variant="outline" className="font-mono text-xs">
                                                                                    {partNum}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                                    <span>{dayjs(part.created_at).format('dddd, MM/DD HH:mm')}</span>
                                                                </div>
                                                            </CardContent>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </div>

                                            <DialogFooter className="sm:justify-start">
                                                <DialogClose asChild>
                                                    <Button type="button">Close</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CommandItem>
                            </CommandGroup>

                            <CommandSeparator/>

                            <CommandGroup heading="Settings">
                                <CommandItem>
                                    <UserIcon/>
                                    <span>Robot Full History</span>
                                </CommandItem>
                                <CommandItem>
                                    <SettingsIcon/>
                                    <span>Robot Settings</span>
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </CommandDialog>
            </div>
        </div>
    );
};

export default RobotHeader;