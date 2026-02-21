"use client";

import React, { useEffect, useState } from 'react';
import {
    Sheet, SheetContent, SheetDescription,
    SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Item } from "@/components/ui/item";
import { Copy, Loader2, Pencil, Rose } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExceptionsTemplates } from "@/futures/exception/getExceptionsTemplates";
import { IIssueTemplate } from "@/types/Exception/ExceptionParse";
import { ButtonGroup } from "@/components/ui/button-group";
import {EditDialog} from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/EditTemplate";
import {CreateTemplate} from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/CreateTemplate";


const TemplateInfo = () => {
    const [value, setValue] = useState<string>("");
    const [filtered, setFiltered] = useState<IIssueTemplate[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<IIssueTemplate | null>(null);

    const queryClient = useQueryClient();

    const { data: templates_data, isLoading } = useQuery({
        queryKey: ['exception-templates'],
        queryFn: getExceptionsTemplates,
        retry: false,
    });

    useEffect(() => {
        if (!templates_data) return;
        if (value.length > 0) {
            setFiltered(
                templates_data.filter((e) =>
                    e.employee_title.toLowerCase().includes(value.toLowerCase())
                )
            );
        } else {
            setFiltered(templates_data);
        }
    }, [value, templates_data]);

    const copyHandler = (error: IIssueTemplate) => {
        try {
            navigator.clipboard.writeText(
                `${error.employee_title}. **** . ${dayjs().format('HH:mm')}`
            );
            toast.success("Copied to clipboard!");
        } catch {
            toast.error("Failed to copy to clipboard!");
        }
    };

    const handleSave = async (updated: IIssueTemplate) => {
        await fetch(`/api/exception/templates/${updated.id}`, {
            method: "PATCH",
            body: JSON.stringify(updated),
        }).then((res) => {
            if (!res.ok) throw new Error();
        });

        // Update cache optimistically
        queryClient.setQueryData<IIssueTemplate[]>(
            ['exception-templates'],
            (old) => old?.map((t) => (t.id === updated.id ? updated : t)) ?? []
        );
    };

    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">
                        <Rose /> Errors
                    </Button>
                </SheetTrigger>

                <SheetContent side="right" className="sm:max-w-[600px] w-full flex flex-col gap-0">
                    <SheetHeader className="pb-4">
                        <SheetTitle>Errors Template</SheetTitle>
                        <SheetDescription>
                            Search and manage your error patterns.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                        <div className={`grid grid-cols-[1fr_150px] gap-2`}>
                            <Input
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Search error title..."
                            />
                            <CreateTemplate />
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center h-32 text-muted-foreground gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading templates…
                            </div>
                        ) : (
                            <ScrollArea className="flex-1 h-screen w-full rounded-md">
                                <div className="flex flex-col gap-2 pr-1">
                                    {filtered.map((error, index) => (
                                        <Item
                                            key={`${error.id}-${index}`}
                                            variant="muted"
                                        >
                                            <div className="w-full">
                                                <div className="grid grid-cols-[85px_auto] gap-2 items-center">
                                                    <ButtonGroup>
                                                        <Button
                                                            onClick={() => copyHandler(error)}
                                                            variant="outline"
                                                            size="icon"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => setEditingTemplate(error)}
                                                            variant="outline"
                                                            size="icon"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </ButtonGroup>

                                                    <div>
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-muted-foreground text-xs">Employee Text:</p>
                                                            <p className="text-sm font-medium">{error.employee_title}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-muted-foreground text-xs">Issue Text:</p>
                                                            <p className="text-sm">{error.issue_type}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Item>
                                    ))}

                                    {filtered.length === 0 && !isLoading && (
                                        <p className="text-center text-sm text-muted-foreground py-8">
                                            No templates found.
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Edit dialog — rendered outside Sheet to avoid z-index issues */}
            <EditDialog
                template={editingTemplate}
                onClose={() => setEditingTemplate(null)}
                onSave={handleSave}
            />
        </>
    );
};

export default TemplateInfo;