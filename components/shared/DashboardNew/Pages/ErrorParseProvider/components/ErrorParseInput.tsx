import React from "react";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ButtonGroup } from "@/components/ui/button-group";
import TemplateInfo from "@/components/shared/ErrorParse/TemplateInfo";

interface Props {
    value: string;
    onChange: (v: string) => void;
    onParse: () => void;
    onClear: () => void;
    isSaving: boolean;
    p3Count: number;
    glpcCount: number;
}

export const ErrorParseInput: React.FC<Props> = ({
                                                     value, onChange, onParse, onClear, isSaving, p3Count, glpcCount,
                                                 }) => (
    <div className="space-y-4">
        <div>
            <div className="flex items-center gap-4 mb-2">
                <p className="text-xs text-muted-foreground">
                    Robots P3: <span className="font-bold text-foreground">{p3Count.toLocaleString()}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                    Robots GLPC: <span className="font-bold text-foreground">{glpcCount.toLocaleString()}</span>
                </p>
            </div>
            <Textarea
                placeholder="取放箱位置错误 Wrong pick and place box position. **** . 07:43"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="font-mono text-sm max-h-[150px]"
            />
        </div>

        <div className="flex gap-3">
            <Button onClick={onParse} disabled={!value.trim() || isSaving}>
                <FileText className="w-4 h-4 mr-2" />
                Parse Data
            </Button>
            <ButtonGroup>
                <Button onClick={onClear} variant="outline" disabled={isSaving}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                </Button>
                <TemplateInfo />
            </ButtonGroup>
        </div>
    </div>
);