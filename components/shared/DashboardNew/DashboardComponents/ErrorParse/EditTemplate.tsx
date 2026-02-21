import React, {useEffect, useState} from "react";
import {IIssueTemplate} from "@/types/Exception/ExceptionParse";
import {toast} from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";

interface EditDialogProps {
    template: IIssueTemplate | null;
    onClose: () => void;
    onSave: (updated: IIssueTemplate) => Promise<void>;
}

export const EditDialog: React.FC<EditDialogProps> = ({ template, onClose, onSave }) => {
    const [form, setForm] = useState<IIssueTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Sync form when template changes
    useEffect(() => {
        setForm(template ? { ...template } : null);
    }, [template]);

    if (!form) return null;

    const handleChange = (field: keyof IIssueTemplate, value: string | number) => {
        setForm((prev) => prev ? { ...prev, [field]: value } : prev);
    };

    const handleSave = async () => {
        if (!form) return;
        setIsSaving(true);
        try {
            await onSave(form);
            toast.success("Template updated.");
            onClose();
        } catch {
            toast.error("Failed to update template.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={!!template} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Error Template</DialogTitle>
                    <DialogDescription>
                        Update the fields below and save.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                            Employee title
                        </Label>
                        <Input
                            value={form.employee_title}
                            onChange={(e) => handleChange("employee_title", e.target.value)}
                            className="h-9"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                            Issue type
                        </Label>
                        <Input
                            value={form.issue_type}
                            onChange={(e) => handleChange("issue_type", e.target.value)}
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
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                Solving time (min)
                            </Label>
                            <Input
                                type="number"
                                value={form.solving_time ?? ""}
                                onChange={(e) => handleChange("solving_time", Number(e.target.value))}
                                className="h-9"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};