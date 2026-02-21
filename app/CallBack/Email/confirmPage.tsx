"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {supabase} from "@/lib/supabaseClient";

type Status = "loading" | "success" | "error";

export default function ConfirmPage() {
    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleConfirm = async () => {
            const token_hash = searchParams.get("token_hash");
            const type = searchParams.get("type"); // "email_change" | "signup" | etc.

            if (!token_hash || !type) {
                setStatus("error");
                setMessage("Invalid confirmation link.");
                return;
            }

            const { error } = await supabase.auth.verifyOtp({
                token_hash,
                type: type as any,
            });

            if (error) {
                setStatus("error");
                setMessage(error.message);
            } else {
                setStatus("success");
                // Обнови юзера в store если нужно
            }
        };

        handleConfirm();
    }, []);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-sm w-full rounded-xl border border-border/40 bg-card p-8 text-center space-y-4">

                {status === "loading" && (
                    <>
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">Confirming your email…</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                        <h2 className="text-lg font-semibold">Email updated!</h2>
                        <p className="text-sm text-muted-foreground">
                            Your email has been successfully changed.
                        </p>
                        <Button className="w-full" onClick={() => router.push("/profile")}>
                            Go to profile
                        </Button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle className="h-10 w-10 text-red-500 mx-auto" />
                        <h2 className="text-lg font-semibold">Something went wrong</h2>
                        <p className="text-sm text-muted-foreground">{message}</p>
                        <Button variant="outline" className="w-full" onClick={() => router.push("/profile")}>
                            Back to profile
                        </Button>
                    </>
                )}

            </div>
        </div>
    );
}