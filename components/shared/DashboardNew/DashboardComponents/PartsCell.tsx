import React, {useState} from "react";
import {Wrench, Minus, ChevronDown, ChevronUp} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {timeToString} from "@/utils/timeToString";

const COLLAPSE_LIMIT = 1;

interface PartEntry {
    parts_numbers: string;
    created_at: number;
}

interface PartsCellProps {
    parts_history: PartEntry[];
}

function PartsCell({parts_history}: PartsCellProps) {
    const [expanded, setExpanded] = useState(false);

    if (parts_history.length === 0) {
        return <Minus size={14} className="text-muted-foreground/40"/>;
    }

    const visible  = expanded ? parts_history : parts_history.slice(0, COLLAPSE_LIMIT);
    const overflow = parts_history.length - COLLAPSE_LIMIT;

    return (
        <div className="flex items-start gap-1.5">
            <div className={`flex flex-col gap-1 ${overflow > 0 ? 'overflow-hidden' : ''}`}>
                {visible.map((el, index) => {
                    let parts: string[] = [];

                    try {
                        parts = JSON.parse(el.parts_numbers);
                    } catch {
                        return null;
                    }

                    if (!parts?.length) return null;

                    return (
                        <div key={index} className="flex items-center gap-2">
                            <Wrench size={12} className="text-muted-foreground shrink-0"/>
                            <Link href="#" className="text-sm font-mono hover:underline">
                                {parts.join(", ")}
                            </Link>
                            {el.created_at && (
                                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {timeToString(el.created_at)}
                            </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {overflow > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                    onClick={() => setExpanded(v => !v)}
                >
                    {expanded ? (
                        <><ChevronUp size={11}/> Hide</>
                    ) : (
                        <><ChevronDown size={11}/> +{overflow} more</>
                    )}
                </Button>
            )}
        </div>
    );
}

export default PartsCell;