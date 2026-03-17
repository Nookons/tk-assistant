import React from 'react';
import Link from "next/link";
import {Link as LinkIcon} from "lucide-react";

const FileLink = ({href, label, sub}: { href: string; label: string; sub?: string }) => (
    <Link
        href={href}
        className="group flex items-start gap-3 px-3 py-2.5 rounded-md border border-transparent hover:border-bg transition-all duration-150"
    >
        <LinkIcon size={16} className="shrink-0 mt-0.5 group-hover:text-emerald-400 transition-colors"/>
        <div className="min-w-0">
            {sub && <div className="text-xs font-bold  mb-0.5">{sub}</div>}
            <div className="text-xs transition-colors truncate">{label}</div>
        </div>
    </Link>
);

export default FileLink;