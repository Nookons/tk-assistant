"use client";

import React, { useState } from "react";
import { IIssueTemplate } from "@/types/Exception/ExceptionParse";
import { toast } from "sonner";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/user";
import {ExceptionService} from "@/services/exceptionService";


const emptyForm = (): Omit<IIssueTemplate, "id" | "created_at" | "updated_at" | "updated_by"> => ({
    employee_title: "",
    issue_type: "",
    issue_sub_type: "",
    issue_description: "",
    recovery_title: "",
    equipment_type: "",
    solving_time: 6,
    created_by: 0,
});

// ─── Component ────────────────────────────────────────────────────────────────

export const CreateTemplate = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [isSaving, setIsSaving] = useState(false);

    const currentUser = useUserStore((s) => s.currentUser);
    const queryClient = useQueryClient();

    const handleChange = (field: keyof typeof form, value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleOpen = () => {
        setForm({ ...emptyForm(), created_by: currentUser?.card_id ?? 0 });
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSave = async () => {
        if (!form.employee_title.trim() || !form.issue_type.trim()) {
            toast.error("Employee title and Issue type are required.");
            return;
        }

        setIsSaving(true);
        try {
            const template = await ExceptionService.createTemplate(form);

            if (!template) throw new Error();

            queryClient.setQueryData<IIssueTemplate[]>(
                ["exception-templates"],
                (old) => [template, ...(old ?? [])]
            );

            toast.success("Template created.");
            handleClose();
        } catch {
            toast.error("Failed to create template.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Button variant="outline" onClick={handleOpen}>
                <Plus className="h-4 w-4 mr-1.5" />
                New Template
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create Error Template</DialogTitle>
                        <DialogDescription>
                            Fill in the fields below to add a new error template.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                Employee title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={form.employee_title}
                                onChange={(e) => handleChange("employee_title", e.target.value)}
                                placeholder="e.g. Abnormal charging"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                Issue type <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={form.issue_type}
                                onChange={(e) => handleChange("issue_type", e.target.value)}
                                placeholder="e.g. Unable to drive"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                Issue sub type
                            </Label>
                            <Input
                                value={form.issue_sub_type ?? ""}
                                onChange={(e) => handleChange("issue_sub_type", e.target.value)}
                                placeholder="e.g. Driver component exception"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                Issue description
                            </Label>
                            <Textarea
                                value={form.issue_description ?? ""}
                                onChange={(e) => handleChange("issue_description", e.target.value)}
                                placeholder="Describe the issue..."
                                rows={3}
                                className="resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                Recovery title
                            </Label>
                            <Textarea
                                value={form.recovery_title ?? ""}
                                onChange={(e) => handleChange("recovery_title", e.target.value)}
                                placeholder="Steps to recover..."
                                rows={2}
                                className="resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Equipment type
                                </Label>
                                <Input
                                    value={form.equipment_type ?? ""}
                                    onChange={(e) => handleChange("equipment_type", e.target.value)}
                                    placeholder="Equipment / Environment / Operation"
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Solving time (min)
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={form.solving_time ?? ""}
                                    onChange={(e) => handleChange("solving_time", Number(e.target.value))}
                                    className="h-9"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                            {isSaving
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
                                : <><Plus className="h-4 w-4" /> Create</>
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};