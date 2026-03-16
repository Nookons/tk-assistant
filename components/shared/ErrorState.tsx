import React from "react";

export function ErrorState({error_title}: {error_title: string}) {
    return (
        <div className="flex h-[50vh] items-center justify-center">
            <p className="text-sm text-destructive">{error_title}</p>
        </div>
    );
}