import React from "react";

export const StatCard = ({icon: Icon, label, value, accent = false,}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    accent?: boolean;
}) => (
    <div
        className={`
            flex flex-col gap-1.5 rounded-xl border px-4 py-3.5
            ${accent
            ? "border-primary/30 bg-primary/5"
            : "border-border/40 bg-card/60"
        }
        `}
    >
        <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            <span className="text-[11px] uppercase tracking-widest font-medium">{label}</span>
        </div>
        <p className={`text-xl font-semibold leading-none ${accent ? "text-primary" : "text-foreground"}`}>
            {value}
        </p>
    </div>
);