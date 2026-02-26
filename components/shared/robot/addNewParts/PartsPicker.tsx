import { Label } from "@/components/ui/label";
import {
    Sheet, SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IRobot } from "@/types/robot/robot";
import { useStockStore } from "@/store/stock";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IStockItemTemplate } from "@/types/stock/StockItem";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import PartPreview from "@/components/shared/robot/PartPreview";

const PartsPicker = ({ robot }: { robot: IRobot }) => {
    const stock_templates = useStockStore(state => state.items_templates);

    const [robot_parts, setRobot_parts] = useState<IStockItemTemplate[]>([]);
    const [selectedPart, setSelectedPart] = useState<IStockItemTemplate | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (stock_templates) {
            setRobot_parts([]);
            for (const part of stock_templates) {
                const isAvailable = part.robot_match.some((type) => type === robot.robot_type);
                if (isAvailable) {
                    setRobot_parts((prev) => [...prev, part]);
                }
            }
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
        setSelectedPart(prev => prev?.material_number === part.material_number ? null : part);
    };


    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Open</Button>
            </SheetTrigger>

            <SheetContent side="bottom" className="h-screen flex flex-col p-0">

                <SheetHeader className="px-6 py-4 border-b shrink-0">
                    <SheetTitle>Select Part</SheetTitle>
                    <SheetDescription>
                        Robot #{robot.robot_number} · {robot.robot_type}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col-reverse md:flex-row">

                    <div className="flex flex-col flex-1 border-r overflow-hidden">

                        <div className="px-4 py-3 border-b shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or part number…"
                                    className="pl-9 h-9"
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1.5 px-0.5">
                                {filteredParts.length} / {robot_parts.length} parts
                            </p>
                        </div>

                        <ScrollArea className="h-[50dvh] md:h-[70dvh]">
                            <div className="grid md:grid-cols-4 gap-2 p-3">
                                {filteredParts.length === 0 ? (
                                    <div className="col-span-full flex items-center justify-center py-16 text-sm text-muted-foreground">
                                        No parts found for &quot;{search}&quot;
                                    </div>
                                ) : filteredParts.map((item) => (
                                    <div
                                        key={item.material_number}
                                        onClick={() => handleSelect(item)}
                                        className={cn(
                                            "p-3 rounded-md border cursor-pointer transition-colors",
                                            selectedPart?.material_number === item.material_number
                                                ? "border-primary bg-primary/10"
                                                : "border-border hover:border-primary/50 hover:bg-muted"
                                        )}
                                    >
                                        <p className="text-[10px] font-mono text-muted-foreground">{item.material_number}</p>
                                        <p className="text-sm font-medium mt-0.5 line-clamp-2">{item.description_eng}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="w-full md:max-w-[400px] shrink-0 flex flex-col p-5 gap-4">
                        {selectedPart ? (
                            <PartPreview selectedPart={selectedPart} />
                        ) : (
                            <p className="text-sm text-muted-foreground">Select a part from the list</p>
                        )}
                    </div>
                </div>

                <SheetFooter className="px-6 py-4 border-t shrink-0">
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    );
};

export default PartsPicker;