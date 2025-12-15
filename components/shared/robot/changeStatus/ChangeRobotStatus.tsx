import React, {useState, useCallback, useEffect} from 'react';
import {Check, ChevronDown, Frown, Laugh, Loader} from "lucide-react";
import {Button} from "@/components/ui/button";
import {IRobot} from "@/types/robot/robot";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {toast} from "sonner";
import {changeRobotStatus} from "@/futures/robots/changeRobotStatus";
import {useUserStore} from "@/store/user";
import {useRobotsStore} from "@/store/robotsStore";

// Define the full options and map them to their API key
const STATUS_OPTIONS: { label: string, key: string }[] = [
    { label: "在线 | Online", key: "在线 | Online" },
    { label: "离线 | Offline", key: "离线 | Offline" },
    // Add other states here if needed (e.g., { label: "维护中 | Maintenance", key: "Maintenance" })
];

const ChangeRobotStatus = ({robot}: { robot: IRobot}) => {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const [selectedKey, setSelectedKey] = useState<string>('');

    const card_id = useUserStore(state => state.current_user?.card_id);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const selectedLabel = STATUS_OPTIONS.find(opt => opt.key === selectedKey)?.label || '';

    const robotStoreUpdate = useRobotsStore(state => state.updateRobot);

    useEffect(() => {
        if (!isSheetOpen) {
            setSelectedKey('');
        }
    }, [isSheetOpen]);


    const onChangeStatus = useCallback(async () => {
        if (!selectedKey) {
            toast.error("Please select a new status.");
            return;
        }

        try {
            setIsLoading(true);

            if (robot.status.toLowerCase() === selectedKey.toLowerCase()) {
                throw new Error("Robot status is already " + selectedKey);
            }

            if (!card_id) {
                throw new Error("User card ID is missing. Please log in again.");
            }

            const res = await changeRobotStatus({
                robot_id: robot.id,
                robot_number: Number(robot.robot_number),
                card_id,
                new_status: selectedKey, // Use the stored clean key
                old_status: robot.status
            });

            if (res) {
                toast.success(`Robot status changed to ${selectedKey} successfully.`);
                setIsSheetOpen(false); // Close the sheet on success
                robotStoreUpdate(robot.id, {
                    status: selectedKey,
                });
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(errorMessage);
            console.error('Change status error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [card_id, robot.id, robot.robot_number, robot.status, selectedKey]);


    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    className="group w-full relative flex items-center gap-2"
                >
                    {/* Simplified Icon Block - Using robot.status to determine initial icon */}
                    <div className="relative w-5 h-5">
                        <Frown
                            className={`
                                absolute inset-0
                                transition-all duration-300
                                group-hover:opacity-0 group-hover:scale-75
                                ${robot.status.toLowerCase() !== 'online' ? 'opacity-100' : 'opacity-0'}
                            `}
                        />
                        <Laugh
                            className={`
                                absolute inset-0 
                                transition-all duration-300
                                ${robot.status.toLowerCase() === 'online' ? 'opacity-100' : 'opacity-0 scale-75'}
                                group-hover:opacity-100 group-hover:scale-100
                            `}
                        />
                    </div>
                    <span>Change Status</span>
                </Button>
            </SheetTrigger>
            <SheetContent className={`w-full sm:max-w-md px-4`}>
                <SheetHeader>
                    <SheetTitle>Change Robot Status</SheetTitle>
                    <SheetDescription>
                        Set the operational status for robot **{robot.robot_number}**. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6">
                    <div className="grid gap-3 w-full">
                        <label className="text-sm font-medium">New Status</label>

                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className="w-full border p-2 rounded-md flex justify-between items-center gap-2 min-w-0"
                                >
                                    <span className="truncate text-left flex-1 min-w-0">
                                        {selectedLabel.length ? selectedLabel : "Select New Status"}
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
                                        placeholder="Type status or select..."
                                        className="h-9"
                                    />
                                    <CommandList className="max-h-[200px] overflow-y-auto">
                                        <CommandEmpty>No status found.</CommandEmpty>
                                        <CommandGroup heading="Robot Status Options">
                                            {STATUS_OPTIONS.map((option, index) => (
                                                <CommandItem
                                                    key={option.key}
                                                    onSelect={() => {
                                                        setSelectedKey(option.key);
                                                        setIsPopoverOpen(false); // Close popover on select
                                                    }}
                                                    className="flex items-center justify-between gap-2 cursor-pointer"
                                                >
                                                    <span className="flex-1 truncate min-w-0">
                                                        {option.label}
                                                    </span>
                                                    <Check
                                                        className={`h-4 w-4 shrink-0 transition-opacity ${
                                                            selectedKey === option.key
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
                    </div>
                </div>

                <SheetFooter>
                    <Button
                        disabled={isLoading || selectedKey === ''}
                        onClick={onChangeStatus}
                    >
                        {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" /> }
                        Save changes
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default ChangeRobotStatus;