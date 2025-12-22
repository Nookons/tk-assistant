import React, {useEffect, useState} from 'react';
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Item} from "@/components/ui/item";
import {Copy, Rose} from "lucide-react";

import errors_data_raw from '../../../utils/ErrorsPatterns/ErrorsPatterns.json'
import dayjs from "dayjs";
import {toast} from "sonner";

interface JsonError {
    id: number;
    employee_title: string;
    first_column: string;
    second_column: string;
    issue_description: string;
    recovery_title: string;
    device_type: string;
    issue_type: string;
    solving_time: number; // В JSON именно это имя
}

// Приведение типов для данных из JSON
const errors_data = errors_data_raw as JsonError[];

const TemplateInfo = () => {
    const [value, setValue] = useState<string>("")

    const [filtered, setFiltered] = useState<JsonError[]>([])

    useEffect(() => {
        setFiltered([])

        if (value.length > 0) {
            const filtered_data = errors_data.filter(error => error.employee_title.toLowerCase().includes(value.toLowerCase()))
            setFiltered(filtered_data)
        } else {
            setFiltered(errors_data)
        }
    }, [value]);

    const copyHandler = (error: JsonError) => {
        try {
            navigator.clipboard.writeText(`${error.employee_title}. **** . ${dayjs().format('HH:mm')}`)
            toast.success("Copied to clipboard!")
        } catch (error) {
            toast.error("Failed to copy to clipboard!")
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline"><Rose /> Errors</Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-[600px] w-full flex flex-col gap-0">
                <SheetHeader className="pb-4">
                    <SheetTitle>Errors Template</SheetTitle>
                    <SheetDescription>
                        Search and manage your error patterns.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 flex flex-col h-[400px] p-4 gap-4">
                    <div className="relative">
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Search error title..."
                            className="w-full"
                        />
                    </div>

                    <ScrollArea className="flex-1 h-screen w-full rounded-md">
                        <div className="flex flex-col gap-2">
                            {filtered.map((error, index) => (
                                <Item
                                    key={`${error.id}-${index}`}
                                    variant={"muted"}
                                    onClick={() => {
                                        // Ваша логика выбора
                                    }}
                                >
                                    <div className={`w-full`}>
                                        <div className={`grid grid-cols-[45px_auto] gap-2 items-center`}>
                                            <Button onClick={() => copyHandler(error)} variant={`outline`} className="">
                                                <Copy />
                                            </Button>
                                            <div>
                                                <h4 className="font-semibold text-sm mt-1 group-hover:text-primary">
                                                    {error.employee_title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                    {error.first_column}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Item>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default TemplateInfo;