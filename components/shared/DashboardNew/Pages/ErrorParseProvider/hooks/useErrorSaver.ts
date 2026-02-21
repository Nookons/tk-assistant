import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ILocalIssue } from "@/types/Exception/ExceptionParse";
import { IUser } from "@/types/user/user";
import { getEmployeesList } from "@/futures/user/getEmployees";
import { addNewException } from "@/futures/exception/addNewException";
import { generateIssueKey } from "@/components/shared/DashboardNew/DashboardComponents/ErrorParse/GenerateIssueKey";
import { getInitialShiftByTime } from "@/futures/Date/getInitialShift";

const REQUEST_DELAY = 150;

export const useErrorSaver = (parsedIssues: ILocalIssue[]) => {
    const [isSaving, setIsSaving]   = useState(false);
    const isSendingRef              = useRef(false);
    const sentKeysRef               = useRef(new Set<string>());
    const abortRef                  = useRef<AbortController | null>(null);

    const abort = () => {
        abortRef.current?.abort();
        isSendingRef.current = false;
        sentKeysRef.current.clear();
    };

    useEffect(() => {
        if (!parsedIssues.length || isSendingRef.current) return;

        const save = async () => {
            isSendingRef.current = true;
            setIsSaving(true);
            abortRef.current = new AbortController();

            try {
                const users: IUser[] | null = await getEmployeesList();
                if (!users) throw new Error("Failed to fetch employees list");

                const newIssues = parsedIssues.filter((issue) => {
                    const key = generateIssueKey(issue);
                    if (sentKeysRef.current.has(key)) return false;
                    sentKeysRef.current.add(key);
                    return true;
                });

                if (!newIssues.length) return;

                let successCount = 0;
                let errorCount   = 0;

                for (let i = 0; i < newIssues.length; i++) {
                    if (abortRef.current?.signal.aborted) break;
                    if (i > 0) await new Promise((r) => setTimeout(r, REQUEST_DELAY));

                    const issue = newIssues[i];

                    try {
                        const user = users.find((u) => u.user_name === issue.employee);
                        if (!user) {
                            console.warn(`User not found: ${issue.employee}`);
                            errorCount++;
                            continue;
                        }

                        await addNewException({
                            data: {
                                ...issue,
                                add_by:     user.card_id.toString(),
                                shift_type: getInitialShiftByTime(issue.error_start_time),
                                uniq_key:   generateIssueKey(issue),
                            },
                        });

                        successCount++;
                    } catch {
                        errorCount++;
                    }
                }

                if (successCount) toast.success(`Saved ${successCount} exception${successCount > 1 ? "s" : ""}`);
                if (errorCount)   toast.error(`Failed to save ${errorCount} exception${errorCount > 1 ? "s" : ""}`);

            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save exceptions");
            } finally {
                isSendingRef.current = false;
                setIsSaving(false);
                abortRef.current = null;
            }
        };

        save();
        return () => abort();
    }, [parsedIssues]);

    return { isSaving, abort };
};