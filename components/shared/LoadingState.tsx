import {Loader2} from "lucide-react";
import React from "react";

export function LoadingState({title}: {title: string}) {
    return (
        <div className="flex h-[50vh] items-center justify-center gap-2 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">{title}</span>
        </div>
    );
}