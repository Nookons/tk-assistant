import { PackageSearch, LucideIcon } from "lucide-react";

export function EmptyState({icon: Icon, title, searchValue}: {
    icon: LucideIcon;
    title: string;
    searchValue: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground rounded-xl border-2 border-dashed border-muted-foreground/15">
            <Icon size={36} className="opacity-25" />
            <div className="text-center">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs mt-0.5 opacity-60">{searchValue}</p>
            </div>
        </div>
    );
}