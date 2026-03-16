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
import {ArrowLeft, Search} from "lucide-react";
import PartPreview from "@/components/shared/robot/PartPreview";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

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
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsOpen(true); }}>
            <SheetTrigger asChild>
                <p>Add new part</p>
            </SheetTrigger>

            <SheetContent
                side="bottom"
                className="h-[100dvh] flex flex-col p-0 rounded-t-2xl"
            >
                <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
                    {/* Мобильный хедер: назад к списку если выбрана деталь */}
                    <div className="flex items-center gap-2">
                        {selectedPart && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 md:hidden -ml-1"
                                onClick={() => setSelectedPart(null)}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
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

                {/* === DESKTOP: side-by-side | MOBILE: stack с переключением === */}
                <div className="flex flex-1 overflow-hidden">

                    {/* СПИСОК — на мобиле скрывается когда выбрана деталь */}
                    <div className={cn(
                        "flex flex-col flex-1 border-r overflow-hidden",
                        // На мобиле: скрываем список если выбрана деталь
                        selectedPart ? "hidden md:flex" : "flex"
                    )}>
                        {/* Поиск */}
                        <div className="px-3 py-2.5 border-b shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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

                        <ScrollArea className="flex-1 h-20">
                            <div className={cn(
                                "gap-2 p-3",
                                // Адаптивная сетка: 2 колонки на мобиле, 4 на десктопе
                                "grid grid-cols-2 md:grid-cols-4"
                            )}>
                                {filteredParts.length === 0 ? (
                                    <div className="col-span-full flex items-center justify-center py-16 text-sm text-muted-foreground">
                                        No parts found for &quot;{search}&quot;
                                    </div>
                                ) : filteredParts.map((item) => (
                                    <div
                                        key={item.material_number}
                                        onClick={() => handleSelect(item)}
                                        className={cn(
                                            "p-2.5 rounded-lg border cursor-pointer transition-colors active:scale-[0.98]",
                                            selectedPart?.material_number === item.material_number
                                                ? "border-primary bg-primary/10"
                                                : "border-border hover:border-primary/50 hover:bg-muted"
                                        )}
                                    >
                                        {/* Превью картинки — всегда показываем на мобиле 2-кол */}
                                        {/*<Avatar className="w-full h-20 aspect-square rounded-md mb-2">
                                            <AvatarImage
                                                src={item.avatar_url}
                                                alt="part image"
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="rounded-md text-xs text-muted-foreground aspect-square">
                                                No img
                                            </AvatarFallback>
                                        </Avatar>*/}
                                        <p className="text-[10px] font-mono text-muted-foreground leading-tight">{item.material_number}</p>
                                        <p className="text-xs font-medium mt-0.5 line-clamp-2 leading-snug">{item.description_eng}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* ПРЕВЬЮ — на мобиле занимает весь экран когда выбрана деталь */}
                    <div className={cn(
                        "md:w-[380px] shrink-0 overflow-y-auto",
                        // На мобиле: показываем только когда выбрана деталь, и на весь экран
                        selectedPart
                            ? "flex flex-col w-full"
                            : "hidden md:flex md:flex-col"
                    )}>
                        {selectedPart ? (
                            <div className="p-4">
                                <PartPreview
                                    setSelectedPart={setSelectedPart}
                                    onSuccess={handleClose}
                                    selectedPart={selectedPart}
                                    robot={robot}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full p-8 text-sm text-muted-foreground text-center">
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