import React from "react";

export const InfoRow = ({icon: Icon, label, value,}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) => (
    <div className="flex items-center gap-3 py-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
            <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                {label}
            </p>
            <p className="text-sm text-foreground font-medium truncate mt-0.5">{value}</p>
        </div>
    </div>
);
