import React from "react";

interface Props {
    errors: string[];
}

export const ErrorParseErrors: React.FC<Props> = ({ errors }) => (
    <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
        <h3 className="text-destructive font-bold mb-2">
            Parse Errors ({errors.length})
        </h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {errors.map((err, i) => (
                <li key={i} className="break-all">{err}</li>
            ))}
        </ul>
    </div>
);