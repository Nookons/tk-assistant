// PartsPicker.tsx — полная замена

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import React, {useEffect, useMemo, useState} from 'react';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {IRobot} from "@/types/robot/robot";
import {useStockStore} from "@/store/stock";
import {ScrollArea} from "@/components/ui/scroll-area";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {cn} from "@/lib/utils";
import {ArrowLeft, ClipboardList, ListPlus, MousePointerClick, MoveLeft, Search} from "lucide-react";
import PartPreview from "@/components/shared/robot/PartPreview";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";

const PartsPicker = ({robot}: { robot: IRobot }) => {
    const stock_templates = useStockStore(state => state.items_templates);

    const [robot_parts, setRobot_parts] = useState<IStockItemTemplate[]>([]);
    const [selectedPart, setSelectedPart] = useState<IStockItemTemplate | null>(null);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (stock_templates) {
            const matched = stock_templates.filter(part =>
                part.robot_match.some(type => type === robot.robot_type)
            );
            setRobot_parts(matched);
        }
    }, [stock_templates]);

    const filteredParts = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return robot_parts;
        return robot_parts.filter(p =>
            p.description_eng?.toLowerCase().includes(q) ||
            p.material_number?.toLowerCase().includes(q)
        );
    }, [robot_parts, search]);

    const handleSelect = (part: IStockItemTemplate) => {
        setSelectedPart(prev =>
            prev?.material_number === part.material_number ? null : part
        );
    };

    const handleClose = () => {
        setIsOpen(false);
        setSelectedPart(null);
        setSearch("");
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => {
            if (!open) handleClose(); else setIsOpen(true);
        }}>
            <SheetTrigger asChild>
                <div className={`flex gap-2 items-center w-full cursor-pointer`}>
                    <ListPlus/>
                    <p>Add new part</p>
                </div>
            </SheetTrigger>

            <SheetContent
                side="bottom"
                className="h-[95dvh] flex flex-col p-0 rounded-t-2xl"
            >
                <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="min-w-0">
                            <SheetTitle className="text-base leading-tight">
                                {selectedPart
                                    ? <span className="truncate block">{selectedPart.description_eng}</span>
                                    : "Select Part"
                                }
                            </SheetTitle>
                            <SheetDescription className="text-xs mt-0.5">
                                Robot #{robot.robot_number} · {robot.robot_type}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex flex-1 overflow-hidden">
                    <div className={cn(
                        "flex flex-col flex-1 border-r overflow-hidden",
                        selectedPart ? "hidden md:flex" : "flex"
                    )}>
                        <div className="px-3 py-2.5 border-b shrink-0">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"/>
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Name or part number…"
                                    className="pl-9 h-9"
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1.5 px-0.5">
                                {filteredParts.length} / {robot_parts.length} parts
                            </p>
                        </div>

                        <ScrollArea className="flex-1 h-0">
                            <div className={`overflow-x-hidden w-100vw`}>
                                <Table>
                                    <TableBody>
                                        {filteredParts.length === 0 ? (
                                            <div
                                                className="col-span-full flex items-center justify-center py-16 text-sm text-muted-foreground">
                                                No parts found for &quot;{search}&quot;
                                            </div>
                                        ) : filteredParts.map((item) => (
                                            <TableRow className={`cursor-pointer ${selectedPart?.material_number === item.material_number && "bg-linear-to-l from-background to-foreground/5"}`} onClick={() => setSelectedPart(item)} key={item.id}>
                                                <TableCell className="font-medium">{item.material_number}</TableCell>
                                                <TableCell className="font-medium text-muted-foreground">{item.description_eng}</TableCell>
                                                <TableCell className="font-medium text-muted-foreground">{item.description_orginall ?? "-"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </ScrollArea>
                    </div>

                    <div className={cn(
                        "md:w-[580px] shrink-0 overflow-y-auto",
                        selectedPart
                            ? "flex flex-col w-full"
                            : "hidden md:flex md:flex-col"
                    )}>
                        {selectedPart ? (
                            <div className="p-4">
                                {selectedPart &&
                                    <Button variant={`ghost`} onClick={() => setSelectedPart(null)} className={`md:hidden mb-2`}>
                                        <MoveLeft /> Back
                                    </Button>
                                }
                                <PartPreview
                                    setSelectedPart={setSelectedPart}
                                    onSuccess={handleClose}
                                    selectedPart={selectedPart}
                                    robot={robot}
                                />
                            </div>
                        ) : (
                            <div
                                className="flex items-center justify-center h-full p-8 text-sm text-muted-foreground text-center">
                                Select a part from the list to see details
                            </div>
                        )}
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    );
};

export default PartsPicker;