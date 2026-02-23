import {Activity, Combine} from "lucide-react";
import React from "react";

export function RobotHistoryIcon({ type }: { type: 'status' | 'parts' }) {
    return (
        <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full">
            {type === 'parts'
                ? <Combine className="h-8 w-8  p-1 text-muted-foreground" />
                : <Activity className="h-8 w-8 p-1 text-muted-foreground" />
            }
        </span>
    )
}