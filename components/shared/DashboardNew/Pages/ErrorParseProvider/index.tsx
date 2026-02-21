"use client";

import React, { useCallback, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";

import { useErrorParser } from "./hooks/useErrorParser";
import { useErrorSaver } from "./hooks/useErrorSaver";
import { useRobotsByWarehouse } from "./hooks/useRobotsByWarehouse";

import { ErrorParseInput } from "./components/ErrorParseInput";
import { ErrorParseErrors } from "./components/ErrorParseErrors";
import { ErrorParseTable } from "./components/ErrorParseTable";

import { formatForClipboard, WarehouseType } from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/FormatForClipboard";
import { toast } from "sonner";

dayjs.extend(duration);
dayjs.extend(utc);

const ErrorParseProvider = () => {
    const { inputValue, setInputValue, parsedIssues, parseErrors, parse, clear } = useErrorParser();
    const { isSaving } = useErrorSaver(parsedIssues);
    const { p3, glpc } = useRobotsByWarehouse();

    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = useCallback((type: WarehouseType) => {
        if (!parsedIssues.length) {
            toast.error("No data to copy");
            return;
        }

        console.log(parsedIssues);

        navigator.clipboard
            .writeText(formatForClipboard(parsedIssues, type))
            .then(() => {
                setIsCopied(true);
                toast.success(`Copied ${type} format to clipboard`);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch(() => toast.error("Failed to copy to clipboard"));
    }, [parsedIssues]);

    return (
        <div className="mx-auto space-y-6">
            <ErrorParseInput
                value={inputValue}
                onChange={setInputValue}
                onParse={parse}
                onClear={clear}
                isSaving={isSaving}
                p3Count={p3.length}
                glpcCount={glpc.length}
            />

            {parseErrors.length > 0 && (
                <ErrorParseErrors errors={parseErrors} />
            )}

            {parsedIssues.length > 0 && (
                <ErrorParseTable
                    issues={parsedIssues}
                    p3Robots={p3}
                    glpcRobots={glpc}
                    isSaving={isSaving}
                    isCopied={isCopied}
                    onCopy={handleCopy}
                />
            )}
        </div>
    );
};

export default ErrorParseProvider;