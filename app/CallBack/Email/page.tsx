import { Suspense } from "react";
import ConfirmPage from "@/app/CallBack/Email/confirmPage";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <ConfirmPage />
        </Suspense>
    );
}